The web application is deployed at https://snakapp.in

<h3>Please have a look at the high quality video demonstration of the web application</h3> 

https://youtu.be/H0wHoXiF_IM

<h3>For demonstrational purposes - </h3>
Credentials for login - 

<b>username - amanchourasiya</b>

<b>password - testuser</b>

<h3>Operational Features  </h3>
<ul>
<li> User Authentication (Sign Up and Sign In)</li>

<li> Search for any Registered User (using his/her username)</li>

<li> Chat and share images with any user</li>

<li> Send invitation to other users for a voice or video call</li>

<li> Make Voice and Video calls with any user</li>

<li> Video/Audio mute/unmute option</li>

<li> Present Screen while in call</li>

<li> Have one-to-one chat while in call (chats are saved as well)</li>

<li> View any user’s Information</li>

<li> Create a group consisting of users in the platform</li>

<li> Chat and share images in the Group</li>

<li> With each image and message, a tag is attached highlighting the sender</li>

<li> Invite group members for a Video call</li>

<li> Make Video calls in a group where anyone in the group can join.</li>

<li> Share Screen while being in a group video call</li>

<li> Video/Audio mute/unmute option in a group video call</li>

<li> Chat with the group members while being in call (chats are saved as well)</li>

<li> Logout from the web application</li>
</ul>

<h3>Directory Structure and explanation </h3>

<b>chat</b> -> A django app that handles chatting and sharing images feature

<b>usergroups</b> -> A django app that handles Group creation and Group image sharing and group meetings.

<b>users</b> -> A django app that handles User Authentication

<b>videocall</b> -> A django that handles Video call between two peers and in a group.

<b>teams</b> -> Django Configuration folder

<b>templates</b> -> Has all the HTML files.

<b>static</b> -> Has all the static files like css, js and other media content.

<h3>Few javascript files explanation</h3>

All javascript files reside in <b>static/js</b> folder.


<b>visualHandler.js</b> -> This file handles the UI when new messages, images arrive in a group or to a user. It also handles video/audio call invitation response.

<b>websockethandler.js</b> -> This file handles the websocket connections and sends messages and images to the backend whenever required.

<b>callandsharep2p.js</b> -> This file handles peer to peer connection using webrtc.

<b>friendrequest.js</b> -> This file handles the event when a user contacts another user for the first time.

<b>imageupload.js</b> -> This file handles the event of sharing images using AJAX.

<b>messageHandler.js</b> -> This file handles the event when new messages and images arrive in a group or
to a user.

<b>videocall.js</b> -> This file handles the UI for clicking video/audio mute/unmute, screen sharing etc.
