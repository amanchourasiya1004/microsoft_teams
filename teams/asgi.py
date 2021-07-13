"""
ASGI config for teams project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/howto/deployment/asgi/
"""

import os
from django.urls import path
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "teams.settings")
django_asgi_app = get_asgi_application()

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from chat.consumers import PersonalChatConsumer, FriendRequestConsumer, GroupChatConsumer
from videocall.consumers import CallConsumer, GroupCallConsumer

application = ProtocolTypeRouter({
    "http":django_asgi_app,
    "websocket":AuthMiddlewareStack(
        URLRouter([
            path('ws/personal/chat/<otheruser>/<username>/', PersonalChatConsumer.as_asgi()),
            path('ws/group/chat/<groupname>/', GroupChatConsumer.as_asgi()),
            path('ws/call/<otheruser>/<username>/', CallConsumer.as_asgi()),
            path('ws/call/<groupname>/', GroupCallConsumer.as_asgi()),
            path('ws/server/contact/',FriendRequestConsumer.as_asgi())
        ])
    )
})