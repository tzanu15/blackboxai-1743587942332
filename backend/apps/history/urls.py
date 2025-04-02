from django.urls import path
from .views import UserHistoryView

urlpatterns = [
    path('', UserHistoryView.as_view(), name='user-history'),
]