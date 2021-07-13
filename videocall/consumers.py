import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from usergroups.models import GroupChats, Groups

class CallConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.person1 = self.scope['url_route']['kwargs']['otheruser']
        self.person2 = self.scope['url_route']['kwargs']['username']
        self.arr = [self.person1, self.person2]
        self.arr.sort()
        self.room_group_name=self.arr[0]+'calls'+self.arr[1]
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
        action = receive_dict['action']
        if(action=="new-offer" or action=="new-answer"):
            receiver_channel_name=receive_dict['message']['receiver_channel_name']
            receive_dict['message']['receiver_channel_name']=self.channel_name

            await self.channel_layer.send(
                receiver_channel_name,
                {
                    'type':'send.sdp',
                    'receive_dict':receive_dict
                }
            )
            return
        if(action=='new-peer'):
            receive_dict['message']['receiver_channel_name']=self.channel_name
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type' : 'send.sdp',
                'receive_dict' : receive_dict,
            }
        )
            
    async def send_sdp(self, event):
        receive_dict=event['receive_dict']
        await self.send(text_data=json.dumps(receive_dict))
    
class GroupCallConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group = self.scope['url_route']['kwargs']['groupname']
        self.room_group_name=self.group
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
        action = receive_dict['action']
        if(action=="new-offer" or action=="new-answer"):
            receiver_channel_name=receive_dict['message']['receiver_channel_name']
            receive_dict['message']['receiver_channel_name']=self.channel_name

            await self.channel_layer.send(
                receiver_channel_name,
                {
                    'type':'send.groupsdp',
                    'receive_dict':receive_dict
                }
            )
            return
        if(action=='message'):
            await self.saveGroupChats(receive_dict['message']['msg'], 1, receive_dict['message']['sender'])
        if(action=='new-peer'):
            receive_dict['message']['receiver_channel_name']=self.channel_name
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type' : 'send.groupsdp',
                'receive_dict' : receive_dict,
            }
        )
            
    async def send_groupsdp(self, event):
        receive_dict=event['receive_dict']
        await self.send(text_data=json.dumps(receive_dict))
        
    @database_sync_to_async
    def saveGroupChats(self, message, msgtype, sender):
        p = GroupChats(group=Groups.objects.get(identity=self.group), chat = message, sender = sender, msgtype=msgtype)
        p.save()