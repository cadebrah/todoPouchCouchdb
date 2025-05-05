import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Checkbox, IconButton } from 'react-native-paper';
import { useThemeColor } from '../hooks/useThemeColor';
import { Todo } from '../lib/models/todo';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type TodoItemProps = {
  todo: Todo;
  onToggleComplete: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggleComplete, onDelete }) => {
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333333' }, 'tint');
  const backgroundColor = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');
  const titleColor = useThemeColor({ light: '#000000', dark: '#ffffff' }, 'text');
  const descriptionColor = useThemeColor({ light: '#757575', dark: '#a0a0a0' }, 'text');

  const handleToggleComplete = async () => {
    try {
      await onToggleComplete(todo._id);
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(todo._id);
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const navigateToEdit = () => {
    router.push(`/todo/${todo._id}`);
  };

  return (
    <ThemedView 
      style={[styles.container, { backgroundColor, borderColor }]}
      lightColor={backgroundColor}
      darkColor={backgroundColor}
    >
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={handleToggleComplete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Checkbox
            status={todo.completed ? 'checked' : 'unchecked'}
            onPress={handleToggleComplete}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.textContainer}
          onPress={navigateToEdit}
        >
          <ThemedText 
            style={[
              styles.title,
              todo.completed && styles.completedText
            ]}
            lightColor={titleColor}
            darkColor={titleColor}
          >
            {todo.title}
          </ThemedText>
          
          {todo.description ? (
            <ThemedText 
              style={[
                styles.description, 
                todo.completed && styles.completedText
              ]}
              lightColor={descriptionColor}
              darkColor={descriptionColor}
            >
              {todo.description}
            </ThemedText>
          ) : null}
        </TouchableOpacity>
        
        <View style={styles.actions}>
          <IconButton
            icon="pencil"
            size={20}
            onPress={navigateToEdit}
          />
          <IconButton
            icon="delete"
            size={20}
            onPress={handleDelete}
          />
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  checkboxContainer: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
    marginLeft: 4,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  actions: {
    flexDirection: 'row',
  },
});

export default TodoItem;