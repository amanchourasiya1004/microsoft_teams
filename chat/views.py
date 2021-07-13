from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import PersonalChats,Friends
from django.core.files.storage import FileSystemStorage
from users.models import UserDetails
from .serializers import PersonalChatsSerializer, GroupChatsSerializer
from usergroups.models import Groups, GroupUsers, GroupChats
from itertools import chain
from django.http import JsonResponse
import json

@login_required
def homeview(request):
    username=request.user.username

    finalchat=[]
    friends = list(chain(request.user.firstfriend.all(), request.user.secondfriend.all()))
    for i in friends:

        fullname=''
        date_joined=''
        last_active=''
        if(i.owner.username != request.user.username):
            userdetail=UserDetails.objects.get(user=i.owner)
            name = i.owner.username
            fullname=i.owner.first_name+' '+i.owner.last_name
            date_joined=i.owner.date_joined
            last_active=i.owner.last_login
        else:
            userdetail=UserDetails.objects.get(user=i.friend)
            name = i.friend.username
            fullname=i.friend.first_name+' '+i.friend.last_name
            date_joined=i.friend.date_joined
            last_active=i.friend.last_login
        
        back=userdetail.background
        font=userdetail.font
        if(len(i.txtmsgs.all()) > 0):
            k1 = i.txtmsgs.latest('time')
        else:
            k1 = None
            
        if(k1 is not None):
            finalchat.append([name, k1.chat, k1.time, k1.msgtype, i.creator, fullname, back, font, userdetail.dob, date_joined, last_active, i.txtmsgs.all()[0].time,0])

    groupenrolled = request.user.groupenrolled.all()
    for i in groupenrolled:
        group=i.group
        k1 = group.chats.latest('time')   
        finalchat.append([group.identity,k1.chat,k1.time,k1.msgtype,k1.sender,group.groupname,group.background,group.font,group.timeCreation,getgroupusers(group),group.description,group.admin.username,1])
        
    sorted_chat = sorted(finalchat, key=lambda obj: obj[2], reverse=True)
    length = len(sorted_chat)

    allmsgs=[]
    for i in sorted_chat:
        if(i[-1]==0):
            allmsgs.append(serialize_data(Friends.objects.get(owner__username = min(i[0],username), friend__username = max(username,i[0]))))
        else:
            allmsgs.append(serialize_data_group(Groups.objects.get(identity=i[0])))

    chats = json.dumps(sorted_chat,default=str)

    updated = request.user.details.updated
    background=request.user.details.background
    font=request.user.details.font

    allmsgs=json.dumps(allmsgs)

    allusers=User.objects.all()
    users=[]
    for i in allusers:
        detail=UserDetails.objects.get(user=i)
        users.append([i.username, i.first_name+' '+i.last_name, detail.background, detail.font, detail.dob, i.date_joined, i.last_login])

    users=json.dumps(users,default=str)
    return render(request, 'chat/index.html', {'chats' : chats, 'length' : length, 'username' : request.user.username, 'users' : users, 'allmsgs':allmsgs, 'fullname':request.user.first_name+' '+request.user.last_name,'updated':updated,'background':background,'font':font, 'dob':UserDetails.objects.get(user=request.user).dob,'date_joined':request.user.date_joined, 'last_login':request.user.last_login})

@login_required
def createfriendship(request):
    if(request.is_ajax() and request.method=='GET'):

        friend=request.GET.get('friend')
        sender=request.GET.get('sender')
        print(request.GET)
        try:
            User.objects.get(username=friend)
        except User.DoesNotExist:
            return JsonResponse({'error':1}, status = 200)

        arr=[sender,friend]
        arr.sort()
        f1=Friends.objects.filter(owner__username = arr[0], friend__username = arr[1])
        if(len(f1)>0):
            return JsonResponse({'exists':1,'error':0},status = 200)

        friendship=Friends(owner=User.objects.get(username=arr[0]),friend=User.objects.get(username=arr[1]),creator=sender)
        friendship.save()

        bingchat=PersonalChats(friend=friendship,chat='',sender=request.user.username,msgtype=0)
        bingchat.save()

        return JsonResponse({'exists':0,'error':0},status=200)
    return JsonResponse({'exists':1,'error':1},status=200)

@login_required
def imagesave(request,sender,receiver):
    if(request.is_ajax() and request.method=='POST'):

        arr=[sender,receiver]
        arr.sort()
        friendobj=Friends.objects.get(owner__username = arr[0], friend__username = arr[1])

        try:
            myfile = request.FILES['data']
            fr = FileSystemStorage()
            filename = fr.save(myfile.name, myfile)
            url = fr.url(filename)
            PersonalChats.objects.create(msgtype=2,friend=friendobj, chat=url,sender=sender)
            return JsonResponse({'error': False, 'path': url})
        except Exception as e:
            print(e)
            return JsonResponse({'error': True})        
    return JsonResponse({'error': True})
    
def serialize_data(friendobj):
    allmsgs=friendobj.txtmsgs.all()
    return PersonalChatsSerializer(allmsgs,many=True).data

def serialize_data_group(group):
    allmsgs=group.chats.all()
    return GroupChatsSerializer(allmsgs,many=True).data

def getgroupusers(group):
    groupusers=[]
    for j in group.groupusers.all():
        groupusers.append(j.user.username)
    return groupusers
