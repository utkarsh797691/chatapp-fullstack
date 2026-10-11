from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers


class RegisterSerializer(serializers.Serializer):
    fullName = serializers.CharField(max_length=150)
    email = serializers.EmailField(max_length=150)
    password = serializers.CharField(write_only=True)
    confirmPassword = serializers.CharField(write_only=True)

    def validate_email(self, value):
        email = value.strip().lower()

        if User.objects.filter(username__iexact=email).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return email

    def validate(self, data):
        if data["password"] != data["confirmPassword"]:
            raise serializers.ValidationError({
                "confirmPassword": "Passwords do not match."
            })

        name_parts = data["fullName"].strip().split(maxsplit=1)

        temp_user = User(
            username=data["email"],
            email=data["email"],
            first_name=name_parts[0],
            last_name=name_parts[1] if len(name_parts) > 1 else ""
        )

        try:
            validate_password(data["password"], user=temp_user)
        except DjangoValidationError as error:
            raise serializers.ValidationError({
                "password": error.messages
            })

        return data

    def create(self, validated_data):
        name_parts = validated_data["fullName"].strip().split(maxsplit=1)

        user = User.objects.create_user(
            username=validated_data["email"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=name_parts[0],
            last_name=name_parts[1] if len(name_parts) > 1 else ""
        )

        return user