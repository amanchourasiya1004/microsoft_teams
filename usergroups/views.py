from django.shortcuts import render
from django.http import HttpResponse
from .models import Groups, GroupUsers, GroupChats
from django.contrib.auth.models import User
from users.views import colorgenerator
from django.http import JsonResponse
from django.core.files.storage import FileSystemStorage
from django.contrib.auth.decorators import login_required
from chat.views import getgroupusers
from users.models import UserDetails
import string
import random
import json

@login_required
def creategroup(request):
    if(request.is_ajax() and request.method=='GET'):
        groupname=request.GET.get('name')
        description=request.GET.get('description')
        participants=request.GET.getlist('participants[]')
        participants.append(request.user.username)
        g=request.user.groupenrolled.all()
        flag=1
        for i in g:
            if(i.group.groupname==groupname):
                flag=0
                break
        if(flag==0):
            return JsonResponse({'error':True,'message':'Group already exists. Try another name.'})
        identity=identitygen()
        color=colorgenerator()
        g=Groups(groupname=groupname,identity=identity,description=description,admin=request.user,num=len(participants),background=color[0],font=color[1])
        g.save()
        
        for i in participants:
            GroupUsers.objects.create(group=g,user=User.objects.get(username=i))
        GroupChats.objects.create(sender=request.user.username,group=g,chat='',msgtype=0)

        return JsonResponse({'error':False})

    allusers=User.objects.all()
    users=[]
    for i in allusers:
        users.append([i.username])
    users=json.dumps(users,default=str)
    return render(request, 'groups/create.html',{'username':request.user.username,'users':users})

@login_required
def imagesave(request,groupname):
    if(request.is_ajax() and request.method=='POST'):
        try:
            grp=Groups.objects.get(identity=groupname)
        except Exception as _:
            return JsonResponse({'error':True})

        try:
            myfile = request.FILES['data']
            fr = FileSystemStorage()
            filename = fr.save(myfile.name, myfile)
            url = fr.url(filename)
            GroupChats.objects.create(msgtype=2,group=grp,chat=url,sender=request.user.username)
            return JsonResponse({'error': False, 'path': url})
        except Exception as e:
            print(e)
            return JsonResponse({'error': True})        
    return JsonResponse({'error': True})

@login_required
def meetingview(request,groupname):
    try:
        grp=Groups.objects.get(identity=groupname)
    except Exception as _:
        return HttpResponse('<p>No such meeting exists.</p>')

    grpusers=getgroupusers(grp)

    usersdata=[]
    for i in grpusers:
        user=User.objects.get(username=i)
        userdetail=UserDetails.objects.get(user=user)
        usersdata.append([user.first_name+' '+user.last_name,userdetail.background,userdetail.font])
    
    grpusers=json.dumps(grpusers,default=str)
    usersdata=json.dumps(usersdata,default=str)
    fullname=request.user.first_name+' '+request.user.last_name
    
    return render(request,'groups/meeting.html',{'fullname':fullname,'groupname':groupname,'username':request.user.username,'groupusers':grpusers,'userdetails':usersdata})

def identitygen():
    while(True):
        idx=''
        for _ in range(8):
            idx+=random.choice(string.ascii_letters)
        ex=Groups.objects.filter(identity=idx)
        if(len(ex)==0):
            return idx
    return ''
