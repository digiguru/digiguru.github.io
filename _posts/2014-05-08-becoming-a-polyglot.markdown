---
layout: post
title:  "Becoming a polyglot programmer"
date:   2014-05-08 22:00:00
categories: blog
tags: 
- java
- cocoa
- net
---

Recently i've been sprinting preparing a very exciting new venture that has force me to write code in languages I had little experience in before. The amazing thing I have learnt is that it's fairly striaghtforward to transfer skills from other languages fairly seemlessly once you've invested time in. The fundamental thing I have realised is good code architecture is universal.

What I like to bring to code is simplification, atomicity and structured design. Consider the following java code...
<!--break-->
{% highlight java %}

public class SearchFragment extends Fragment {
	private final String SEARCH_URL = RequestConstants.SERVER_GUEST_URL+"search/";
	
	private Handler searchServiceHandler = new Handler() {

		public void handleMessage(Message msg) {
            //Reads the data from a JSON response
            //Displays an alert if there is an error.
			//Puts data into an intent object on response. 
            // (60 lines)
        }
	};
	
	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container,
			Bundle savedInstanceState) {
        
        //Gets saved data from local cache, reads from a JSON array
        //Displays an alert if there is an error.
        //Record some flurry events
        //Setup some user interaction - if text box is subitted start a task in another thread.
        // (90 lines)    
            
	}
    
	class SearchServiceTask extends AsyncTask<String, Void, Void>
	{
        //Kicking off a background task.
        //Display loading panel
        //Define HttpRequest
        //Submit request
        //Recieve response
        //Catch all errors and log, and copile a list

		protected void onPreExecute() {
			//Start Progress Dialog (Message)
            //(5 lines)
		}
        
		@Override
		protected Void doInBackground(String... details) {
            //Make the request
            //Read the response
            //Log any errors
            //(50 lines)
		}

		protected void onPostExecute(Void unused) {
			// Close progress dialog
            //If errors show a message
			//If successful result call the searchServiceHandler.
            //Update UI elements
            (40 lines)
		}
	}
}

{% endhighlight %}

For me it just feels like it's doing too much. Worse still the same style was duplicated in every web request.

The first thing I did was define an interface that I wanted this to follow fro an API level.

{% highlight java %}

//First let's define the completion block
//all we care about is "What's the result?" or "Why did it fail?" 
interface IBlockList<listType> {
	void success(List<listType> list);
	void error(String message);
}

interface IServiceWedding {
	
	void  searchBySearchText (
        
        String searchText, 
        String domain, 
        IBlockList<SearchResult> completeBlock);
	
}

{% endhighlight %}

Very simple interface, I can drop that into any file and not care about JSON, HTTP Requests, Asyncronosity. Just raw input output.

Now all I have to do is write each of the parts in isolation.


{% highlight java %}

public class DataService implements IServiceWedding {
	
    //These 2 functions will probably move to a base class.
	private HttpResponse makeGetRequest(String url) throws Exception 
	{
		//Make a get request with all the headers
        //(10 lines)
	}
	private String getResultText(String url) throws Exception {
		//Use a URL and call makeGetRequest, read the result into a string.
        //(20 lines)
	}
	
    //These 2 functions could probably be reused for any service that returns the same data.
	private ArrayList<SearchResult> readSearchResultList (String response) throws JSONException {
		//Read a JSON string into a list of SearchResult
        //(10 lines)
	}
	
	private SearchResult readSearchResult (String response) throws JSONException {
		//Read a JSON string into a SearchResult
        //(2 lines)
	}
	
    //Finally the implementation. Every time you want a new websevice, this is all you have to write!
	@Override
	public void searchWeddingBySearchText(String searchText, String domain,
			IBlockList<SearchResult> completeBlock) {
            
        String url = getDomainUrl(domain) + "search/" + searchText;
		
		try {
			String textResult = getResultText(url);
			completeBlock.success(this.readSearchResultList(textResult));
		} catch (JSONException e) {
			completeBlock.error("Could not process the data from the server");
		} catch (Exception e1) {
			completeBlock.error("Error reading data from the server");
		}
	}
}
{% endhighlight %}

I certainly prefer the second style. It's how I'd write the code in any language, define the right interface and then use it.

