/**
 * Loads a JavaScript file and executes a function from it.
 * 
 * @param {string} url - The URL of the JavaScript file to load.
 * @param {Function} implementationCode - The function to execute after the file is loaded.
 */
async function loadJS(url, implementationCode) {
  let importFile = await import(url);
  implementationCode(importFile);
}

/**
 * Cloud object that contains the API for the addons and services to interact with the server.
 * 
 * @namespace Cloud
 * @property {Object} data - The data object that contains the data to be shared with the addons.
 * @property {Object} service - The service object that contains the API for the addons to interact with the server.
 * @property {Object} window - The window object that contains the API for the addons to interact with the DOM.
 */

const Cloud = {
  data: {},
  service: {
    getText: async (filename) => {
      const request = await fetch("/files/" + filename);
      if (request.status == 404) {
        console.error("File not found");
        window.location.href = "/";
      }
      return await request.text();
    },
    updateFile: async (filename, content) => {
      const request = await fetch("/files/" + filename + "/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content }),
      });
      console.log(await request.text());
      // return await request.text();
    },
    createNewFile: async (filename, content) => {
      const request = await fetch("/files/" + filename, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content }),
      });
      return await request.text();
    },
  },
  /**
   * The window object that contains the API for the addons to interact with the DOM.
   * 
   * @namespace Cloud.window  
   * @property {Function} writeInnerText - Writes text to an element.
   * @property {Function} getInnerText - Retrieves the inner text of an element.
   * @property {Function} getValue - Retrieves the value of an element.
   * @property {Function} getElement - Retrieves an element by its ID.
   * @property {Object} shortcuts - The shortcuts object that contains the API for the addons to register keyboard shortcuts.
   */
  window: {
    writeInnerText: (element, text) => {
      console.log("Element: ", text);
      document.getElementById(element).innerHTML = text;
    },
    getInnerText: (element) => {
      return document.getElementById(element).innerText;
    },
    getValue: (element) => {
      return document.getElementById(element).value;
    },
    getElement: (element) => {
      return document.getElementById(element);
    },
    /**
     * Registers a keyboard shortcut.
     * @namespace Cloud.window.shortcuts
     */
    shortcuts: {
      register(strg=true, shift=false, key, callback) {
        document.addEventListener("keydown", (e) => {
          //check if strg is pressed if strg is true
          if(strg && !e.ctrlKey) return;
          if(shift && !e.shiftKey) return;
          if (e.key === key) {
            e.preventDefault();
            callback();
          }
        });
      }
    }
  },
};

window.addEventListener("load", (event) => {
  let global_scope = document.getElementById("main_scope");
  global_scope.style.display = "none";
  initExtension();
  console.log("[Addon Manager] All contents have been loaded");
  global_scope.style.display = "block";
});

let resourceToLoad = [];
let javascriptObjects = [];
let file_name;

async function initExtension() {
  let extension_name = window.location.pathname.split("/")[2];
  file_name = window.location.pathname.split("/")[3];
  console.log(window.location.pathname.split("/")[2]);

  // update the context of the Cloud object
  Cloud.data.fileID = file_name;

  const request = await fetch("/addons/api/" + extension_name);
  let jsonResponse = await request.json();
  document.title = "Cloud | " + jsonResponse.meta.name;
  Cloud.data.filename = jsonResponse.meta.name;

  document.getElementById("main_scope_title").innerText =
    jsonResponse.meta.name;
  for (let i = 0; i < jsonResponse.content.serve.length; i++) {
    const resource = jsonResponse.content.serve[i];
    if (resource.type != "javascript") {
      resourceToLoad.push(resource);
    }
  }

  for (let i = 0; i < jsonResponse.meta.api.length; i++) {
    const resource = jsonResponse.meta.api[i];
    let path = "/addons/api/" + resource;
    const name_i = resource.split("/");
    await loadJS(path, (module) => {
      console.log("Script loaded");
      javascriptObjects.push({ as: name_i[1], content: module });
    });
  }

  for (let i = 0; i < jsonResponse.content.html.header.length; i++) {
    const dom_element = jsonResponse.content.html.header[i];
    loadDOM(dom_element, document.getElementById("main_scope"));
  }

  loadDOM({ type: "br" }, document.getElementById("main_scope"));

  for (let i = 0; i < jsonResponse.content.html.body.length; i++) {
    console.log(jsonResponse.content.html.body[i]);
    const dom_element = jsonResponse.content.html.body[i];
    loadDOM(dom_element, document.getElementById("main_scope"));
  }
}

/**
 * Dynamically loads a DOM element into the specified parent element.
 * 
 * @param {Object} dom_element - The DOM element object to be created and loaded.
 * @param {HTMLElement} parent_element - The parent element where the new element will be appended.
 */
function loadDOM(dom_element, parent_element) {
  /** @type HTMLElement */
  let element = document.createElement(dom_element.type);
  if (dom_element.id) element.id = dom_element.id;
  element.classList.add("addon_ui_element");
  if (dom_element.class) element.classList.add(...dom_element.class);
  if (dom_element.innerText) element.innerText = dom_element.innerText;
  parent_element.appendChild(element);
  if (dom_element.onLoad) getFunctionFromModule(dom_element.onLoad)();
  if (dom_element.onPress)
    element.addEventListener("click", () =>
      getFunctionFromModule(dom_element.onPress)()
    );
}

/**
 * Retrieves a function by its name from an imported module.
 * 
 * @param {string} function_name - The name of the function to retrieve.
 * @returns {Function} The function retrieved from the module.
 */
function getFunctionFromModule(function_name) {
  console.log("Function name: " + function_name);
  var params = function_name.split("/");

  for (const key in javascriptObjects) {
    const element = javascriptObjects[key];
    console.log(javascriptObjects);
    if (element.as == params[0]) {
      console.log("Module found: " + element.as);
      for (const property in element.content) {
        if (property == params[1]) {
          let selected_function = element.content[property];
          console.log("Function found: " + property);
          return () => {
            selected_function();
          };
        }
      }
    }
  }
}
