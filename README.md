The web application is deployed at https://snakapp.in

High quality video demonstration is available at https://youtu.be/XRy3ClvhP08

Operational Features - 

1. User Authentication (Sign Up and Sign In)

2. Search for any Registered User (using his/her username)

3. Chat and share images with any user

4. Send invitation to other users for a voice or video call

5. Make Voice and Video calls with any user

6. Video/Audio mute/unmute option

7. Present Screen while in call

8. Have one-to-one chat while in call (chats are saved as well)

9. View any user’s Information

10. Create a group consisting of users in the platform

11. Chat and share images in the Group

12. With each image and message, a tag is attached highlighting the sender

13. Invite group members for a Video call

14. Make Video calls in a group where anyone in the group can join.

15. Share Screen while being in a group video call

16. Video/Audio mute/unmute option in a group video call

17. Chat with the group members while being in call (chats are saved as well)

18. Logout from the web application

Directory Structure and explanation -------------------------------------------------------------

chat -> A django app that handles chatting and sharing images feature

usergroups -> A django app that handles Group creation and Group image sharing and group meetings.

users -> A django app that handles User Authentication

videocall -> A django that handles Video call between two peers and in a group.

teams -> Django Configuration folder

templates -> Has all the HTML files.

static -> Has all the static files like css, js and other media content.

Few javascript files explanation ---------------------------------------------------------------

All javascript files reside in static/js folder.


visualHandler.js -> This file handles the UI when new messages, images arrive in a group or to a user. It also handles video/audio call invitation response.

websockerhandler.js -> This file handles the websocket connections and sends messages and images to the backend whenever required.

callandsharep2p.js -> This file handles peer to peer connection using webrtc.

friendrequest.js -> This file handles the event when a user contacts another user for the first time.

imageupload.js -> This file handles the event of sharing images using AJAX.

messageHandler.js -> This file handles the event when new messages and images arrive in a group or
to a user.

videocall.js -> This file handles the UI for clicking video/audio mute/unmute, screen sharing etc.
