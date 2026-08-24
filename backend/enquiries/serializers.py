from rest_framework import serializers
from .models import Enquiry


class EnquiryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = [
            'first_name', 'last_name', 'email', 'phone',
            'subject', 'message', 'source', 'related_slug',
        ]

    def create(self, validated_data):
        return Enquiry.objects.create(**validated_data)
