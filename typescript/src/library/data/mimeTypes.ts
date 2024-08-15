export function processMimeType(mimeType: string): string {
    switch(mimeType) {
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return "description";
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            return "table_chart";
        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            return "slideshow";
        case "application/vnd.ms-excel":
            return "table_chart";
        case "application/pdf":
            return "picture_as_pdf";
        case "application/json":
            return "data_object";
        case "application/zip":
            return "archive";
        case "application/x-rar":
            return "archive";
        case "application/x-7z-compressed":
            return "archive";
        case "application/x-msdownload":
            return "terminal";
        case "application/vnd.ms-powerpoint":
            return "slideshow";
        case "application/vnd.ms-word":
            return "description";
        case "text/csv":
            return "table_chart";
        case "application/json":
            return "data_object";
        case "application/json;charset=utf-8":
            return "data_object";
    }

    if(mimeType.startsWith("image")) return "image";
    if(mimeType.startsWith("video")) return "movie";
    if(mimeType.startsWith("audio")) return "library_music";
    if(mimeType.startsWith("text")) return "article";

    return "description";
}