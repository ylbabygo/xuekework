import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './Todos.css';

interface TodoList {
  id: string;
  name: string;
  description: string;
  color: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  items: TodoItem[];
}

interface TodoItem {
  id: string;
  list_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_completed: boolean;
  due_date?: string;
  completed_at?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Stats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  completionRate: number;
  categoryStats: { [key: string]: number };
  priorityStats: { [key: string]: number };
}

interface ListFormData {
  name: string;
  description: string;
  color: string;
}

interface ItemFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
}

// 可拖拽的待办事项组件
interface SortableItemProps {
  item: TodoItem;
  onStatusChange: (itemId: string, completed: boolean) => void;
  onEdit: (item: TodoItem) => void;
  onDelete: (itemId: string) => void;
  priorityColors: Record<string, string>;
  formatDate: (dateString: string) => string;
  isOverdue: (dateString: string) => boolean;
}

function SortableItem({ 
  item, 
  onStatusChange, 
  onEdit, 
  onDelete, 
  priorityColors, 
  formatDate, 
  isOverdue 
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* 拖拽手柄 */}
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>

        {/* 状态切换按钮 */}
        <button
          onClick={() => onStatusChange(item.id, !item.is_completed)}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            item.is_completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-green-500'
          }`}
        >
          {item.is_completed && (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* 内容区域 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`font-medium ${item.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {item.title}
              </h4>
              {item.description && (
                <p className={`text-sm mt-1 ${item.is_completed ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.description}
                </p>
              )}
              
              <div className="flex items-center gap-3 mt-2">
                {/* 优先级 */}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[item.priority]}`}>
                  {item.priority === 'low' ? '低' : item.priority === 'medium' ? '中' : item.priority === 'high' ? '高' : '紧急'}
                </span>
                
                {/* 截止日期 */}
                {item.due_date && (
                  <span className={`text-xs ${
                    isOverdue(item.due_date) && !item.is_completed
                      ? 'text-red-600 font-medium'
                      : 'text-gray-500'
                  }`}>
                    {formatDate(item.due_date)}
                  </span>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => onEdit(item)}
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Todos() {
  const [activeTab, setActiveTab] = useState<'lists' | 'stats'>('lists');
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [selectedList, setSelectedList] = useState<TodoList | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [showListModal, setShowListModal] = useState<boolean>(false);
  const [showItemModal, setShowItemModal] = useState<boolean>(false);
  const [editingList, setEditingList] = useState<TodoList | null>(null);
  const [editingItem, setEditingItem] = useState<TodoItem | null>(null);
  const [listFormData, setListFormData] = useState<ListFormData>({
    name: '',
    description: '',
    color: '#3B82F6'
  });
  const [itemFormData, setItemFormData] = useState<ItemFormData>({
    title: '',
    description: '',
    priority: 'medium',
    due_date: ''
  });

  const priorityColors = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-red-600 bg-red-50',
    urgent: 'text-purple-600 bg-purple-50'
  };

  // 拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 加载数据
  useEffect(() => {
    loadTodoLists();
    loadCategories();
    if (activeTab === 'stats') {
      loadStats();
    }
  }, [activeTab]);

  const loadTodoLists = async () => {
    try {
      const response = await fetch('/api/v1/todos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTodoLists(data.data);
        if (data.data.length > 0 && !selectedList) {
          setSelectedList(data.data[0]);
        }
      }
    } catch (error) {
      console.error('加载待办清单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/v1/todos/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/v1/todos/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  const handleListSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const url = editingList ? `/api/v1/todos/${editingList.id}` : '/api/v1/todos';
      const method = editingList ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(listFormData)
      });
      const data = await response.json();
      if (data.success) {
        setShowListModal(false);
        setEditingList(null);
        setListFormData({ name: '', description: '', color: '#3B82F6' });
        loadTodoLists();
      }
    } catch (error) {
      console.error('保存待办清单失败:', error);
    }
  };

  const handleItemSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedList) return;
    
    try {
      const url = editingItem 
        ? `/api/v1/todos/${selectedList.id}/items/${editingItem.id}` 
        : `/api/v1/todos/${selectedList.id}/items`;
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(itemFormData)
      });
      const data = await response.json();
      if (data.success) {
        setShowItemModal(false);
        setEditingItem(null);
        setItemFormData({ title: '', description: '', priority: 'medium', due_date: '' });
        loadTodoLists();
      }
    } catch (error) {
      console.error('保存待办事项失败:', error);
    }
  };

  const handleEditList = (list: TodoList) => {
    setEditingList(list);
    setListFormData({
      name: list.name,
      description: list.description,
      color: list.color
    });
    setShowListModal(true);
  };

  const handleEditItem = (item: TodoItem) => {
    setEditingItem(item);
    setItemFormData({
      title: item.title,
      description: item.description,
      priority: item.priority,
      due_date: item.due_date ? item.due_date.split('T')[0] : ''
    });
    setShowItemModal(true);
  };

  const handleDeleteList = async (listId: string) => {
    if (!window.confirm('确定要删除这个待办清单吗？这将删除清单中的所有事项。')) return;

    try {
      const response = await fetch(`/api/v1/todos/${listId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        if (selectedList?.id === listId) {
          setSelectedList(null);
        }
        loadTodoLists();
      }
    } catch (error) {
      console.error('删除待办清单失败:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!selectedList || !window.confirm('确定要删除这个待办事项吗？')) return;

    try {
      const response = await fetch(`/api/v1/todos/${selectedList.id}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        loadTodoLists();
      }
    } catch (error) {
      console.error('删除待办事项失败:', error);
    }
  };

  const handleStatusChange = async (itemId: string, completed: boolean) => {
    if (!selectedList) return;
    
    try {
      const response = await fetch(`/api/v1/todos/${selectedList.id}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ is_completed: completed })
      });

      const data = await response.json();
      if (data.success) {
        loadTodoLists();
      }
    } catch (error) {
      console.error('更新状态失败:', error);
    }
  };

  // 处理拖拽结束
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!selectedList || !over || active.id === over.id) {
      return;
    }

    const oldIndex = selectedList.items.findIndex(item => item.id === active.id);
    const newIndex = selectedList.items.findIndex(item => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // 乐观更新UI
    const newItems = arrayMove(selectedList.items, oldIndex, newIndex);
    const updatedList = { ...selectedList, items: newItems };
    setSelectedList(updatedList);
    
    // 更新todoLists中的对应清单
    setTodoLists(prev => prev.map(list => 
      list.id === selectedList.id ? updatedList : list
    ));

    try {
      // 发送新的排序到后端
      const itemIds = newItems.map(item => item.id);
      const response = await fetch(`/api/v1/todos/${selectedList.id}/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ itemIds })
      });

      const data = await response.json();
      if (!data.success) {
        // 如果失败，重新加载数据
        loadTodoLists();
      }
    } catch (error) {
      console.error('更新排序失败:', error);
      // 如果失败，重新加载数据
      loadTodoLists();
    }
  };

  const getSmartSuggestions = async () => {
    if (!itemFormData.title) return;

    try {
      const response = await fetch('/api/v1/todos/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ title: itemFormData.title, description: itemFormData.description })
      });

      const data = await response.json();
      if (data.success) {
        const suggestions = data.data;
        if (suggestions.priority && itemFormData.priority === 'medium') {
          setItemFormData(prev => ({ ...prev, priority: suggestions.priority }));
        }
      }
    } catch (error) {
      console.error('获取智能建议失败:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate: string | undefined) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const renderListsTab = () => (
    <div className="flex h-full">
      {/* 左侧清单列表 */}
      <div className="w-1/3 border-r border-gray-200 bg-gray-50">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">待办清单</h2>
            <button
              onClick={() => setShowListModal(true)}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建清单
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
            </div>
          ) : todoLists.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-8 w-8 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 text-sm">暂无待办清单</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todoLists.map(list => (
                <div
                  key={list.id}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedList?.id === list.id 
                      ? 'bg-white shadow-sm border border-gray-200' 
                      : 'hover:bg-white hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedList(list)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: list.color }}
                      ></div>
                      <div>
                        <h3 className="font-medium text-gray-900">{list.name}</h3>
                        <p className="text-sm text-gray-500">{list.items?.length || 0} 个事项</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditList(list);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteList(list.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 右侧事项列表 */}
      <div className="flex-1 bg-white">
        {selectedList ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: selectedList.color }}
                  ></div>
                  {selectedList.name}
                </h2>
                {selectedList.description && (
                  <p className="text-gray-600 mt-1">{selectedList.description}</p>
                )}
              </div>
              <button
                onClick={() => setShowItemModal(true)}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新建事项
              </button>
            </div>

            {/* 筛选器 */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="搜索事项..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">所有状态</option>
                <option value="false">未完成</option>
                <option value="true">已完成</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
              >
                <option value="">所有优先级</option>
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="urgent">紧急</option>
              </select>
            </div>

      {/* 待办事项列表 */}
            {selectedList.items?.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无待办事项</h3>
                <p className="text-gray-500 mb-6">在此清单中创建您的第一个待办事项</p>
                <button
                  onClick={() => setShowItemModal(true)}
                  className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  创建待办事项
                </button>
              </div>
            ) : (
              <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={selectedList.items?.map(item => item.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {selectedList.items
                      ?.filter(item => {
                        const matchesSearch = !searchTerm || 
                          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase());
                        const matchesStatus = !selectedStatus || item.is_completed.toString() === selectedStatus;
                        const matchesPriority = !selectedPriority || item.priority === selectedPriority;
                        return matchesSearch && matchesStatus && matchesPriority;
                      })
                      .map(item => (
                        <SortableItem
                          key={item.id}
                          item={item}
                          onStatusChange={handleStatusChange}
                          onEdit={handleEditItem}
                          onDelete={handleDeleteItem}
                          priorityColors={priorityColors}
                          formatDate={formatDate}
                          isOverdue={isOverdue}
                        />
                      ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>请选择一个待办清单</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStatsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">统计数据</h2>
      
      {stats && (
        <>
          {/* 总览卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总计</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">已完成</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">进行中</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">完成率</p>
                  <p className="text-3xl font-bold text-blue-600">{Math.round(stats.completionRate)}%</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* 分类统计 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">分类统计</h3>
            <div className="space-y-3">
              {Object.entries(stats.categoryStats).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-gray-700">{category}</span>
                  <span className="font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 标签页导航 */}
        <div className="flex space-x-1 bg-white rounded-2xl p-2 shadow-sm border border-gray-100 mb-8 w-fit">
          <button
            onClick={() => setActiveTab('lists')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'lists'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            清单管理
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            数据统计
          </button>
        </div>

        {/* 内容区域 */}
        {activeTab === 'lists' ? renderListsTab() : renderStatsTab()}

        {/* 清单模态框 */}
        {showListModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingList ? '编辑清单' : '新建清单'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowListModal(false);
                      setEditingList(null);
                      setListFormData({ name: '', description: '', color: '#3B82F6' });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleListSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">清单名称</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={listFormData.name}
                      onChange={(e) => setListFormData({ ...listFormData, name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      value={listFormData.description}
                      onChange={(e) => setListFormData({ ...listFormData, description: e.target.value })}
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowListModal(false);
                        setEditingList(null);
                        setListFormData({ name: '', description: '', color: '#3B82F6' });
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      {editingList ? '更新' : '创建'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 事项模态框 */}
        {showItemModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingItem ? '编辑待办事项' : '新建待办事项'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowItemModal(false);
                      setEditingItem(null);
                      setItemFormData({ title: '', description: '', priority: 'medium', due_date: '' });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleItemSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={itemFormData.title}
                      onChange={(e) => setItemFormData({ ...itemFormData, title: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      value={itemFormData.description}
                      onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">优先级</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={itemFormData.priority}
                        onChange={(e) => setItemFormData({ ...itemFormData, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                      >
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                        <option value="urgent">紧急</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">截止日期</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={itemFormData.due_date}
                        onChange={(e) => setItemFormData({ ...itemFormData, due_date: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowItemModal(false);
                        setEditingItem(null);
                        setItemFormData({ title: '', description: '', priority: 'medium', due_date: '' });
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      {editingItem ? '更新' : '创建'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Todos;