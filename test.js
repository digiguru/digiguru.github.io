/*brackets-xunit: includes=//code.jquery.com/jquery-1.11.0.min.js */

var Data = {getData: function() {}};

$(function () {
function resolveAfter (time, args) {
    var dfd = new $.Deferred();
    window.setTimeout(function () {
        dfd.resolve(args);
    }, time || 1000);
    return dfd.promise();
}
function failAfter (time, args) {
    var dfd = new $.Deferred();
    window.setTimeout(function () {
        dfd.reject(args);
    }, time || 1000);
    return dfd.promise();
}
 

$.fn.examplePlugin = function() {
 
    return this.each(function() {
        
        var $this = $(this);
        $this.on("click", function() {
            Data.getData().
                then(function(d) {
                    $this.data("pass", true);
                    $this.html(d.message);
                    $this.trigger("update");
                }).
                fail(function(args) {
                    $this.data("pass", false);
                    $this.text("Could not get any data");
                    $this.trigger("update");
                });
        });
        
    });
 
};

 



test("Control updates after a pass", function () {
    stop();
    
    //First setup a mock of the data service.
    Data.getData = function() {
        return resolveAfter(10, {message: "example data"});
    };
    var $div = $("<div></div>").appendTo("body");
    $div.examplePlugin();
    $div.trigger("click");
    $div.on("update", function() {
        start();
        ok($div.data("pass"), "Sucessful service sets pass to true");
        equal($div.html(), "example data", "Data returned updates the UI");
    });
});

test("Control updates after a pass", function () {
    stop();
    
    //First setup a mock of the data service.
    Data.getData = function() {
        return failAfter(1000, {message: "example data"});
    };
    var $div = $("<div></div>").appendTo("body");
    $div.examplePlugin();
    $div.trigger("click");
    $div.on("update", function() {
        start();
        ok(!$div.data("pass"), "Failes data set pass to false");
        equal($div.text(), "Could not get any data", "Failed data message");
    });
});
   
test("Here is a test", function() {
    ok(true, "A passing test.");
});


test("This won't work", function() {
    window.setTimeout(function () {
        ok(true, "This won't get associated with the test.");
    }, 1000);
});
    
    test("Here is an async", function() {
    stop();
    window.setTimeout(function () {
        start();
        ok(true, "A passing test.");
    }, 1000);
});
    asyncTest("Another async test", function() {
    window.setTimeout(function () {
        start();
        ok(true, "Didn't have to say 'stop()'.");
    }, 1000);
});
});
