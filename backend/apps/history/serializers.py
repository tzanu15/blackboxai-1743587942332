from rest_framework import serializers
from .models import UserHistory

class UserHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserHistory
        fields = ['id', 'action', 'details', 'timestamp']
        read_only_fields = ['timestamp']