from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from .models import UserDetails
import random
import string
import datetime

# Create your views here.
path_var = 'users/teamsSignUp.html'
literal='users/teamsSignIn.html'
path_extradetails='users/extraDetails.html'

def index(request):
    if(request.user.is_authenticated):
        return redirect('homeview')
    return render(request,'users/land_page.html')

def signupteams(request):
    if(request.user.is_authenticated):
        return redirect('homeview')
    global curr_username
    if request.method == 'POST':
        username = request.POST.get('username')
        username=removespaces(username)
        if(len(username)>20):
            return render(request,path_var,{'error':'Username should not exceed 20 characters.'})
        email = request.POST.get('email')
        email=removespaces(email)
        password = request.POST.get('password')
        password=removespaces(password)
        existing=User.objects.filter(email=email)
        if len(existing) == 0:
            try:
                teamsuser = User.objects.create_user(username=username,email=email,password=password)
            except Exception as _:
                return render(request,path_var,{'error':'Invalid Credentials. Username already in use.'})
            teamsuser.first_name="Anonymous"
            teamsuser.last_name="User"
            teamsuser.save()
            colors=colorgenerator()
            userdetail=UserDetails(dob=datetime.datetime.date(datetime.datetime.now()),user=teamsuser,background=colors[0],font=colors[1])
            userdetail.save()
            login(request, teamsuser)
            return redirect('extradetails')
        else:
            return render(request, path_var, {'error' : 'Email already in use.'})
    return render(request,path_var)

def signinteams(request):
    if(request.user.is_authenticated):
        return redirect('homeview')
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        if len(User.objects.filter(username=username)) != 0:
            user = authenticate(username = username, password = password)
            if(user != None):
                login(request, user)
                return redirect('homeview')
            else:
                return render(request, literal, {'error' : 'Wrong Password'})
        else:
            return render(request, literal, {'error' : 'User does not exist. Create a Teams account first.'})
    return render(request, literal)

@login_required
def extradetails(request):
    if request.method == 'POST':
        fn = request.POST.get('first_name')
        fn=removespaces(fn)
        ln = request.POST.get('last_name')
        ln=removespaces(ln)
        dob = request.POST.get('dob')
        dob=removespaces(dob)
        try:
            user=User.objects.get(username=request.user.username)
        except User.DoesNotExist:
            return render(request,path_extradetails,{'error':'User does not exist.'})
        x=len(fn)*len(ln)*len(dob)
        if(x==0 or len(dob)!=10):
            return render(request,path_extradetails,{'error':'Invalid Credentials.'})
        user.first_name = fn
        user.last_name = ln
        userdetail=UserDetails.objects.get(user=user)
        dob=dob.split('-')
        try:
            userdetail.dob = datetime.date(int(dob[0]),int(dob[1]),int(dob[2]))
        except Exception as _:
            return render(request,path_extradetails,{'error':'Invalid Date of Birth.'})
        userdetail.updated=1
        userdetail.save()
        user.save()
        return redirect('homeview')
    return render(request,path_extradetails)

@login_required
def logoutview(request):
    logout(request)
    return redirect('indexview')

def colorgenerator():
    r=random.randint(0,255)
    g=random.randint(0,255)
    b=random.randint(0,255)
    color='rgb('+str(r)+','+str(g)+','+str(b)+')'
    lum=255-0.299*r-0.587*g-0.114*b
    if(lum<105):
        return [color,'rgb(0,0,0)']
    return [color,'rgb(255,255,255)']

def removespaces(name):
    name=name.rstrip()
    name=name.lstrip()
    return name