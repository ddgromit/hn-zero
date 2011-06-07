// ==UserScript==
// @name         Hacker News Zero
// @namespace    hnzero
// @match http://news.ycombinator.com/*
// @exclude http://news.ycombinator.com/item*
// @author       Derek Dahmer
// @description  Hides HN articles after you've read both the article and comments, so you can get to HN Zero for at least a fleeting moment every once in a while.
// ==/UserScript==

// a function that loads jQuery and calls a callback function when jQuery has finished loading
// source: http://erikvold.com/blog/index.cfm/2010/6/14/using-jquery-with-a-user-script
function addJQuery(callback) {
    var script = document.createElement("script");
    script.setAttribute("src", "http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js");
    script.addEventListener('load', function() {
        var script = document.createElement("script");
        script.textContent = "(" + callback.toString() + ")();";
        document.body.appendChild(script);
    }, false);
    document.body.appendChild(script);
}

function main() {
    $articleTable = $("table table .title:first").parents('table:first');

    // Some CSS for hovering that couldn't be done inline
    $("<style>.title:hover .hide-anyway { display: inline; } .hide-anyway { display:none; color:#A2A2A2;cursor:pointer;} .hide-anyway:hover { color:white;background-color:#A2A2A2; }</style>").appendTo("head");

    // Divide into posts
    var posts = [];
    var titleRow = null;

    $articleTable.find('tr').each(function(index,el) {
        // Ignore spacer rows
        if ($(el).attr('style') !== undefined || $(el).find("span").length === 0) {
            return;
        }

        //Divide into title and comment rows
        if (titleRow === null) {
            titleRow = el;
        } else {
            commentRow = el;

            // Get the item id from an attr in the comment row
            itemId = $(el).find('span').attr('id').split('_')[1];

            // Get the <a> that has the title
            titleAnchor = $(titleRow).find('a')[1];

            // Get the <a> that has the comments
            commentAnchor = $(commentRow).find('a')[1];

            // Find the spacing element
            spacingEl = $(commentRow).next();

            // Create an object with all the useful post properties
            var post = {
                'titleRow':titleRow,
                'commentRow':el,
                'itemId':itemId,
                'titleAnchor':titleAnchor,
                'commentAnchor':commentAnchor,
                'spacingEl':spacingEl
            };
            posts.push(post);

            titleRow = null;
        }
    });

    // For debugging
    window.hnposts = posts;


    // Do interesting stuff with the lines of posts
    $(posts).each(function(index,post) {
        // Record when the title link was clicked
        $(post.titleAnchor).click(function() {
            localStorage.setItem("visitedItem" + post.itemId,"1");

            // Follow through to link
            return true;
        });

        // Record when the comments link was clicked
        $(post.commentAnchor).click(function() {
            localStorage.setItem("visitedItemComments" + post.itemId,"1");

            // Follow through to link
            return true;
        });

        // Use web storage to store if a post has been visited
        visitedItem = localStorage.getItem("visitedItem" + post.itemId) == "1";
        visitedItemComments = localStorage.getItem("visitedItemComments" + post.itemId) == "1";
        hideAnyway = localStorage.getItem("hideAnyway" + post.itemId) == "1";

        function hideRow(post) {
            $(post.titleRow).hide();
            $(post.commentRow).hide();
            $(post.spacingEl).hide();
        }

        if ((visitedItem && visitedItemComments) || hideAnyway) {
            // Hide the entire row when both links have been clicked or X hit
            hideRow(post);
        } else if (visitedItem || visitedItemComments) {
            // Maybe highlight the comments or title to show whats left to do?
        }

        // Add an X button that manually hides a post
        $hideAnyway = $("<span class='hide-anyway'>&#x2718;</span>").click(function() {
            localStorage.setItem("hideAnyway" + post.itemId,"1");
            hideRow(post);
        });
        $(post.titleRow).find('.comhead').after($hideAnyway);

    });
}

// load jQuery and execute the main function
addJQuery(main);
