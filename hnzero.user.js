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

// the guts of this userscript
function main() {
    console.log ('loaded');
    $articleTable = $("table table .title:first").parents('table:first');

    // Make the main table 100% so we can right align the X button
    $articleTable.attr('width','100%');

    // Divide into posts
    var posts = [];
    var titleRow = null;

    $articleTable.find('tr').each(function(index,el) {
        // Ignore spacer rows
        if ($(el).attr('style') !== undefined || $(el).find("span").length == 0) {
            return;
        }
        //Divide into top and bottom rows
        if (titleRow == null) {
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
            var pair = {
                'titleRow':titleRow,
                'commentRow':el,
                'itemId':itemId,
                'titleAnchor':titleAnchor,
                'commentAnchor':commentAnchor,
                'spacingEl':spacingEl
            };
            titleRow = null;
            posts.push(pair);



            // Test by coloring
            //$(pair.titleRow).css('background-color','red');
            //$(pair.commentRow).css('background-color','green');
        }
    });
    window.posts = posts;

    $(posts).each(function(index,post) {
        // Record when the title was clicked
        $(post.titleAnchor).click(function() {
            localStorage.setItem("visitedItem" + post.itemId,"1");

            // Follow through to link
            return true;
        });

        // Record when the comments were clicked
        $(post.commentAnchor).click(function() {
            localStorage.setItem("visitedItemComments" + post.itemId,"1");

            // Follow through to link
            return true;
        });

        // Hide when both have been clicked
        visitedItem = localStorage.getItem("visitedItem" + post.itemId) == "1";
        visitedItemComments = localStorage.getItem("visitedItemComments" + post.itemId) == "1";
        hideAnyway = localStorage.getItem("hideAnyway" + post.itemId) == "1";

        function hideRow(post) {
            $(post.titleRow).hide();
            $(post.commentRow).hide();
            $(post.spacingEl).hide()
        }

        if ((visitedItem && visitedItemComments) || hideAnyway) {
            // Hide the entire row
            hideRow(post);
        } else if (visitedItem || visitedItemComments) {
            // Add an X button to hide
            $(post.titleRow).append("<td style='color:#DBDBD3;cursor:pointer;'>X&nbsp;</td>").click(function() {
                localStorage.setItem("hideAnyway" + post.itemId,"1");
                hideRow(post);
            });
        }

    });
}

// load jQuery and execute the main function
addJQuery(main);
