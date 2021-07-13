from django.urls import path
from . import views

urlpatterns = [
    path('',views.index,name='indexview'),
    path('signup/',views.signupteams,name='signupteams'),
    path('signin/',views.signinteams,name='signinteams'),
    path('extradetails/',views.extradetails,name='extradetails'),
    path('logout/',views.logoutview,name='logoutview')
]