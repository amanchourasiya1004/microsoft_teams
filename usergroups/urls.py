from django.urls import path
from . import views

urlpatterns = [
    path('create/',views.creategroup,name='creategroup'),
    path('image/<groupname>/',views.imagesave,name='imagegroup'),
    path('meeting/<groupname>/',views.meetingview,name='meetingview'),
]