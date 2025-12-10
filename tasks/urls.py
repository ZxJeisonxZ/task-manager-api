from django.urls import path
from . import views

urlpatterns = [
    path('api/tasks/', views.TaskListCreateAPIView.as_view(), name='task-list'),
    path('api/tasks/<int:pk>/', views.TaskDetailAPIView.as_view(), name='task-detail'),
    
    path('', views.home_view, name='home'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
]