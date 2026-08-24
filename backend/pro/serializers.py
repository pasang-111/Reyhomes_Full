from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.models import UserProfile
from .models import Contract, BuildProject, Milestone, MessageThread, Message, Notification, ClientInclusion

User = get_user_model()


class ProUserSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source="profile.phone", read_only=True)
    is_client = serializers.BooleanField(source="profile.is_client", read_only=True)
    is_reypro = serializers.BooleanField(source="profile.is_reypro", read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "phone", "is_client", "is_reypro"]


class ContractSerializer(serializers.ModelSerializer):
    home_design_name = serializers.CharField(source="home_design.title", read_only=True)
    land_package_name = serializers.CharField(source="land_package.title", read_only=True)
    class Meta:
        model = Contract
        fields = ["id", "title", "home_design_name", "land_package_name", "status", "contract_value", "signed_date", "notes", "created_at", "updated_at"]


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = ["id", "title", "description", "status", "order", "due_date", "completed_at"]


class BuildProjectSerializer(serializers.ModelSerializer):
    contract = ContractSerializer(read_only=True)
    milestones = MilestoneSerializer(many=True, read_only=True)
    progress = serializers.SerializerMethodField()

    class Meta:
        model = BuildProject
        fields = ["id", "contract", "current_stage", "site_address", "start_date", "estimated_completion", "progress", "milestones"]

    def get_progress(self, obj):
        total = obj.milestones.count()
        if not total:
            return 0
        return round(obj.milestones.filter(status="completed").count() / total * 100)


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    mine = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ["id", "sender_name", "mine", "body", "read", "created_at"]
        read_only_fields = fields

    def get_sender_name(self, obj):
        return obj.sender.get_full_name() or obj.sender.email

    def get_mine(self, obj):
        request = self.context.get("request")
        return bool(request and request.user.id == obj.sender_id)


class MessageThreadSerializer(serializers.ModelSerializer):
    agent_name = serializers.SerializerMethodField()
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = MessageThread
        fields = ["id", "subject", "agent_name", "created_at", "updated_at", "messages"]

    def get_agent_name(self, obj):
        return obj.agent.get_full_name() or obj.agent.email


class SendMessageSerializer(serializers.Serializer):
    body = serializers.CharField(max_length=5000, allow_blank=False)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "title", "message", "notification_type", "read", "link", "created_at"]


class ClientInclusionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientInclusion
        fields = ["id", "category", "title", "description", "selected", "notes", "build", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at", "build"]

    def validate(self, attrs):
        request = self.context["request"]
        if not request.user.profile.is_reypro:
            raise serializers.ValidationError("ReyHomes Pro access is required.")
        return attrs


class AdminClientSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    agent_name = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ["user_id", "email", "first_name", "last_name", "phone", "is_client", "is_reypro", "assigned_agent", "agent_name", "marketing_opt_in", "updated_at"]

    def get_agent_name(self, obj):
        if not obj.assigned_agent:
            return None
        return obj.assigned_agent.get_full_name() or obj.assigned_agent.email
