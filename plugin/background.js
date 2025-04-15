// Add a context menu action on every image element in the page.
browser.menus.create({
    id: "Bookmark",
    title: "Add to the collected URL",
    contexts: [ "all" ],
});