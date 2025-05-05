import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, FAB, Menu, Snackbar } from 'react-native-paper';

import EmptyState from '../../components/EmptyState';
import SyncIndicator from '../../components/SyncIndicator';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import TodoItem from '../../components/TodoItem';
import { useDatabase } from '../../hooks/useDatabase';
import { useThemeColor } from '../../hooks/useThemeColor';
import { localDB } from '../../lib/db';
import { Todo, TodoRepository } from '../../lib/models/todo';

export default function TodoListScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [filterCompleted, setFilterCompleted] = useState<boolean | null>(null);
  
  const { isInitialized, syncStatus, syncError, restartSync } = useDatabase();
  
  const backgroundColor = useThemeColor({ light: '#f5f5f5', dark: '#000000' }, 'background');
  const fabColor = useThemeColor({ light: '#2196f3', dark: '#4dabf5' }, 'tint');

  // This function is now primarily used for filtering
  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      let todoList: Todo[];
      
      if (filterCompleted === null) {
        // Get all todos
        todoList = await TodoRepository.getAll();
      } else {
        // Get filtered todos
        todoList = await TodoRepository.getByStatus(filterCompleted);
      }
      
      setTodos(todoList);
    } catch (error) {
      console.error('Error loading todos:', error);
      setSnackbarMessage('Error loading todos');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  }, [filterCompleted]);

  // Set up subscription to todos changes when screen is focused
  useFocusEffect(
    useCallback(() => {
      let subscription: any = null;
      
      if (isInitialized) {
        // Set loading to true initially
        setLoading(true);
        
        // Load initial todos
        loadTodos();
        
        // Subscribe to PouchDB changes
        if (filterCompleted === null) {
          const changes = localDB.changes({
            since: 'now',
            live: true,
            include_docs: true,
          }).on('change', () => {
            loadTodos();
          });
          
          subscription = changes;
        }
      }

      // Clean up subscription when screen loses focus
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }, [isInitialized, filterCompleted, loadTodos])
  );

  // Also subscribe to filter changes
  useEffect(() => {
    if (isInitialized && filterCompleted !== null) {
      loadTodos();
    }
  }, [filterCompleted, isInitialized, loadTodos]);

  // Toggle todo completion status
  const toggleComplete = async (id: string) => {
    try {
      await TodoRepository.toggleComplete(id);
      // No need to manually reload - the subscription will update the UI
    } catch (error) {
      console.error('Error toggling todo completion:', error);
      setSnackbarMessage('Error updating todo');
      setSnackbarVisible(true);
    }
  };

  // Delete a todo
  const deleteTodo = async (id: string) => {
    try {
      await TodoRepository.delete(id);
      // No need to manually reload - the subscription will update the UI
    } catch (error) {
      console.error('Error deleting todo:', error);
      setSnackbarMessage('Error deleting todo');
      setSnackbarVisible(true);
    }
  };

  // Handle filter change
  const handleFilterChange = (completed: boolean | null) => {
    setFilterCompleted(completed);
    setMenuVisible(false);
  };

  // Delete all completed todos
  const deleteCompleted = async () => {
    try {
      const count = await TodoRepository.deleteCompleted();
      setMenuVisible(false);
      setSnackbarMessage(`Deleted ${count} completed ${count === 1 ? 'todo' : 'todos'}`);
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error deleting completed todos:', error);
      setSnackbarMessage('Error deleting completed todos');
      setSnackbarVisible(true);
    }
  };

  // Rest of your component remains the same
  const renderFilterIndicator = () => {
    if (filterCompleted === null) return null;
    
    return (
      <View style={styles.filterIndicator}>
        <ThemedText style={styles.filterText}>
          {filterCompleted ? 'Showing completed' : 'Showing active'}
        </ThemedText>
        <Button
          mode="text"
          onPress={() => handleFilterChange(null)}
          compact
        >
          Clear
        </Button>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={fabColor} />
        </View>
      );
    }
    if (todos.length === 0) {
      if (filterCompleted === true) {
        return (
          <EmptyState
            title="No completed tasks"
            description="Your completed tasks will appear here."
            icon="check-circle"
          />
        );
      } else if (filterCompleted === false) {
        return (
          <EmptyState
            title="All tasks completed!"
            description="Add a new task to get started."
            buttonLabel="Add Task"
            onButtonPress={() => router.push('/todo/new')}
          />
        );
      }
      return (
        <EmptyState
          title="No todos yet"
          description="Add your first todo to get started"
          buttonLabel="Add Todo"
          onButtonPress={() => router.push('/todo/new')}
        />
      );
    }
    return (
      <FlatList
        data={todos}
        renderItem={({ item }) => (
          <TodoItem
            todo={item}
            onToggleComplete={toggleComplete}
            onDelete={deleteTodo}
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
      />
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {renderFilterIndicator()}
      {renderContent()}
      
      <View style={styles.fabContainer}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="contained"
              icon="filter"
              onPress={() => setMenuVisible(true)}
              style={styles.filterButton}
            >
              Filter
            </Button>
          }
        >
          <Menu.Item
            title="All Tasks"
            onPress={() => handleFilterChange(null)}
            leadingIcon="list-ul"
          />
          <Menu.Item
            title="Active Tasks"
            onPress={() => handleFilterChange(false)}
            leadingIcon="circle"
          />
          <Menu.Item
            title="Completed Tasks"
            onPress={() => handleFilterChange(true)}
            leadingIcon="check-circle"
          />
          <Divider />
          <Menu.Item
            title="Clear Completed"
            onPress={deleteCompleted}
            leadingIcon="trash"
            disabled={!todos.some(todo => todo.completed)}
          />
        </Menu>
        
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: fabColor }]}
          onPress={() => router.push('/todo/new')}
        />
      </View>
      
      {syncStatus && (
        <View style={styles.syncContainer}>
          <SyncIndicator status={syncStatus} onRestart={restartSync} />
          <ThemedText style={styles.syncText}>
            {syncError ? 'Sync Error' : syncStatus === 'active' ? 'Syncing...' : 'Offline'}
          </ThemedText>
        </View>
      )}
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        {snackbarMessage}
      </Snackbar>
    </ThemedView>
  );
}

// Helper component for Menu
const Divider = () => (
  <View style={{ height: 1, backgroundColor: 'rgba(0, 0, 0, 0.1)', margin: 4 }} />
);

// Your existing styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 100, // Extra space for FAB
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    marginRight: 8,
    borderRadius: 28,
  },
  fab: {
    borderRadius: 28,
  },
  syncContainer: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  syncText: {
    fontSize: 12,
    marginLeft: 8,
  },
  filterIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  filterText: {
    fontSize: 14,
  },
});