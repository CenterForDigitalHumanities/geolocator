#GEOLOCATOR HELP VIDEO

Emily Henken
4/8/2024


Hello, Welcome to the RERUM Geolocator. In this video I will walk through the steps on how to use this tool.

First things first, there are two main functionalities of this site.
	1. Creating a navplace object
	2. Creating a Geolocating Web annotation.

Chances are, if you have come to this site, then that means you have a research object, reflected in the form of a URI link. Make sure you have that handy as we walk through these steps.

So, the difference between these two options is where exactly the geometry you are defining is stored. Before we begin, it is important to understand so you can use the right tool according to your research goals.
	- When creating a navplace object, you are defining a primary property to your resource, called 'navplace'. This is the standard name for the IIIF community. 
	- With the Geolpcating web annotation, you are defining a Secondary property consisting of geometry. 

We will talk through this and an example later on.
Let's start with defining a navplace property.


**How to: Create the navplace object.**
Optionally, provide a name or email or something to attribute the resource to you. This will be saved into the JSON, primarily, along with the navplace property.
Supply the URI of the object to which you want to add the navplace object. Here I have my personal URI.
When you hit “Next”, if you get a warning, there will be some helpful popups that explain what the issue was. Otherwise, the resource’s JSON will pop up below as a preview.

This is just your already existing resource provided from the URI, but next we add the “creator” property, and next we will construct the "navPlace" property.

**How to: Create the geometry of the navPlace property.**
Here is where you draw the geometry you desire. There are options for a point, line, and polygon. (point click, line draw the points and end eith a double click/2nd click on last point, polygon ends the same way as the line). You can switch or trash the geometry at any time; you do not move on until you hit "See preview"

**How to: Final Step**
Congrats, you have made it to the final step. This is where we look over all our progress, and officially create our new and improved resource. 
As you can see, the object constains all the old properties, now with the 'creator' and 'navplace' properties.
Now, if something in here looks wrong, if your navplace is off, if you accidentally provided the wrong URI, you misspelled your name, don’t worry, nothing is official yet. At the bottom you can “Start Over”, which will bring you back to the first page where you provided the URI and creator attribute.

But if it does look right, and you want to save your object as a new URI, then we can move on.
If you just want it for yourself, there is a download button at the top that will download the JSON object to your computer.

Otherwise, hitting “Create” will bring you here, where your new and improved resource is at this link, which can now be viewed in navplace viewer.
As you can see, this is exactly the geometry we created for this!


If your goal was to create a navplace property, then you are complete! If you are still trying to learn about creating a Geolocating web annotation, then keep listening. 

**How to: Geolocating Web Annotation**
Back on the home page, we click on the Geolocating Web Annotation button.
Recall that at the beginning of this video, I explained that while navplace objects are a primary property of a resource, the geolocating annotation is secondary. That means, for example, if you wanted to apply geometry to a resource about an event that happened somewhere, the location of that event should be in the navplace property. But, there may be other supplemental locations that are associated with the event, but not quite necessary for the definition. These would be defined as web annotations.

Moving forward, the process is exactly the same as creating a navplace object. Supply your name, optionally, and URI - note that this object already has a navpalce object, its primary geometry - and define your geometry how you please.

In the preview, you can see there is no new navplace being defined, as this object already had one. but rather just coordinates stored. 
When you are done here, you can download the object for yourself and you can view it in the Annotation Viewer.

This concludes the tutorial on how to annotate a IIIF research object using the rerum geolocator. Thank you, and good luck!
