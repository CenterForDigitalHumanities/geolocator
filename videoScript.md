#GEOLOCATOR HELP VIDEO

Emily Henken
4/8/2024


Intro
Welcome
Purpose of site
Developed by Open Source @ SLU
Links at bottom

**Should I have “About Geolocator” first?

**Landing Page**
“Learn more” Links
Difference between 2 options. They function the same, but serve different purposes.
Why/when you would want to choose each
Describe “Create a navplace object” and describe “Geolocating Web Annotation”

**How to: Create the navplace object.**
Optionally, provide a name or email or something to attribute the resource to you. This will be saved into the JSON, as you will see in the end.
Supply the URI of the object to which you want to add the navplace object.
When you hit “Next”, the resource’s JSON will pop up below.
UNRESOLVABLE: https://iiif.io/api/cookbook/recipe/000m-image/manifest.json 
Note that if the URI cannot be found, AKA is not resolvable, the site will warn you before you move on. (Explain error message)

Lets look now at the case where the URI points to a resource that IS RESOLVABLE, and DOES NOT yet have a navplace object. (**GO GET A NEW URI FROM THE REPO SOMEWHERE TO DEMO**)
As you can see, the JSON will appear with no warnings. This is just your already existing resource provided from the URI, but now we add the “creator” property, as you can see at the bottom, and next we will add the navPlace property.

Note that there also may be a case where the resource you provided already has an existing navplace Property in it.  https://iiif.io/api/cookbook/recipe/0154-geo-extension/manifest.json 
If you want to continue, you can, but it will overwrite the previous navplace property and create a new one in the next step. Luckily, Geolocator will give you this warning so that you don’t accidentally overwrite anything if you do not want to.
	
Let’s go back to this resource, the one with no navplace property yet, and add it. Once everything looks right, Go ahead and hit “Confirm URI”.


**How to: Create the geometry of the navPlace property.**




**How to: Final Step**
Congrats, you have made it to the final step. This is where we look over all our progress, and officially create our new and improved resource.
(Point out original JSON vs new properties)
Now, if something in here looks wrong, if your navplace is off, if you accidentally provided the wrong URI, you misspelled your name, don’t worry, nothing is official yet. At the bottom you can “Start Over”, which will bring you back to the first page where you provided the URI and creator attribute.
But if it does look right, and you want to (save your object to rerum?) Hit Create.
If you just want it for yourself, there is a download button at the top that will download the JSON object to your computer.

Hitting “Create” will bring you here, where your new and improved resource is at this link (Open link)
You can see it in navplace viewer too. As you can see, this is exactly the geometry we created for this!


**How to: Geolocating Web Annotation**
(Navegate here)
Notice that in the web annotator, it does not matter if this resource already has a navplace property. That is because _________.
In terms of what you need to be doing, everything here pretty much works the same.
Differences:
__
__
At the end, you still have this link you can take with you, but you view it in the Annotation Viewer because it is a LOUD W3C Web Annotation. If you want to learn more about these types of annotations, you can visit the “Additional Links” page.
