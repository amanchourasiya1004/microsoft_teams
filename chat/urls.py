from django.urls import path
from . import views

urlpatterns = [
    path('',views.homeview,name='homeview'),
    path('create/',views.createfriendship,name='createfriends'),
    path('image/<sender>/<receiver>/',views.imagesave,name='imagesave'),
]