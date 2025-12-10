from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.views.decorators.http import require_POST
from django.shortcuts import redirect

from rest_framework import permissions
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.authentication import TokenAuthentication, SessionAuthentication

from .models import Task
from .serializers import TaskSerializer
from .pagination import TaskPagination


class TaskListCreateAPIView(ListCreateAPIView):
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = Task.objects.all().order_by('-created_at')
    serializer_class = TaskSerializer
    pagination_class = TaskPagination


class TaskDetailAPIView(RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


@login_required
def home_view(request):
    """Vista principal del frontend"""
    return render(request, 'tasks/index.html')


def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            
            # Redirigir al parámetro 'next' o al home
            next_url = request.GET.get('next', '/')
            return redirect(next_url)
    
    else:
        # Si ya está autenticado, redirigir al home
        if request.user.is_authenticated:
            return redirect('home')
        form = AuthenticationForm()
    
    # Pasar el parámetro 'next' al template
    next_param = request.GET.get('next', '/')
    return render(request, 'tasks/login.html', {
        'form': form,
        'next': next_param
    })


@require_POST
def logout_view(request):
    """Cerrar sesión y redirigir a login"""
    logout(request)
    return redirect('login')