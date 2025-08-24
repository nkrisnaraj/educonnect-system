from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class RoomMessagesView(APIView):
	"""
	API view to return chat messages for a given room.
	Currently returns empty list; implement message retrieval logic as needed.
	"""
	permission_classes = [IsAuthenticated]

	def get(self, request, room_id):
		# TODO: fetch messages for room_id
		return Response({"room_id": room_id, "messages": []})
