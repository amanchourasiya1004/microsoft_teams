import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import PersonalChats, Friends
from usergroups.models import GroupChats, Groups
from django.contrib.auth.models import User

class PersonalChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.person1 = self.scope['url_route']['kwargs']['otheruser']
        self.person2 = self.scope['url_route']['kwargs']['username']
        self.arr = [self.person1, self.person2]
        self.arr.sort()
        self.room_group_name = self.arr[0] + 'talks' + self.arr[1]
        print(self.room_group_name)
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self,close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        msg_data = json.loads(text_data)
        message = msg_data['message']
        senttype = msg_data['type']
        if(senttype<2):
            await self.savePersonalChats(message, senttype)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type' : 'personalchat.message',
                'message' : message,
                'sender' : self.person2,
                'msg_type' : senttype
            }
        )
            
    async def personalchat_message(self, event):
        message = event['message']
        sender = event['sender']
        msg_type = event['msg_type']
        await self.send(text_data = json.dumps({
            'message': message,
            'sender' : sender,
            'msg_type' : msg_type,
            'isgroup' : 0
        }))

    @database_sync_to_async
    def savePersonalChats(self, message, msgtype):
        p = PersonalChats(friend = Friends.objects.get(owner__username = self.arr[0], friend__username = self.arr[1]), chat = message, sender = self.person2, msgtype=msgtype)
        p.save()

class GroupChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.group = self.scope['url_route']['kwargs']['groupname']
        self.room_group_name = self.group
        print(self.room_group_name)
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self,close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        msg_data = json.loads(text_data)
        message = msg_data['message']
        senttype = msg_data['type']
        sender=msg_data['sender']
        if(senttype<2 or senttype==3):
            await self.saveGroupChats(message, senttype, sender)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type' : 'group.message',
                'message' : message,
                'sender' : sender,
                'msg_type' : senttype,
                'groupname' : self.group
            }
        )
            
    async def group_message(self, event):
        message = event['message']
        sender = event['sender']
        msg_type = event['msg_type']
        groupname=event['groupname']
        await self.send(text_data = json.dumps({
            'message': message,
            'sender' : sender,
            'msg_type' : msg_type,
            'groupname' : groupname,
            'isgroup' : 1
        }))

    @database_sync_to_async
    def saveGroupChats(self, message, msgtype, sender):
        p = GroupChats(group=Groups.objects.get(identity=self.group), chat = message, sender = sender, msgtype=msgtype)
        p.save()

class FriendRequestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.person = self.scope['user'].username
        self.room_group_name = "Servercontact"
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self,close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        receive_dict = json.loads(text_data)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type' : 'send.request',
                'receive_dict' : receive_dict,
            }
        )
            
    async def send_request(self, event):
        receive_dict=event['receive_dict']
        await self.send(text_data=json.dumps(receive_dict))