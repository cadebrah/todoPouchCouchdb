import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Snackbar, TextInput } from 'react-native-paper';

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useThemeColor } from '../../hooks/useThemeColor';
import { TodoRepository } from '../../lib/models/todo';

const validateTodo = (title: string, description: string): string | null => {
  if (!title.trim()) return 'Title is required';
  if (title.trim().length > 100) return 'Title must be less than 100 characters';
  if (description.trim().length > 500) return 'Description must be less than 500 characters';
  return null;
};

const handleError = (error: unknown, action: string): string => {
  console.error(`Error ${action} todo:`, error);
  return error instanceof Error ? error.message : `Error ${action} todo`;
};

export default function TodoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNewTodo = id === 'new';
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [loading, setLoading] = useState(!isNewTodo);
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const backgroundColor = useThemeColor({ light: '#f5f5f5', dark: '#000000' }, 'background');
  const cardBackgroundColor = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');
  const buttonColor = useThemeColor({ light: '#2196f3', dark: '#4dabf5' }, 'tint');
  const errorColor = useThemeColor({ light: '#f44336', dark: '#f44336' }, 'text');
  const textColor = useThemeColor({ light: '#000000', dark: '#ffffff' }, 'text');

  // Fetch todo if editing an existing one
  useEffect(() => {
    if (!isNewTodo) {
      const fetchTodo = async () => {
        try {
          setLoading(true);
          const fetchedTodo = await TodoRepository.getById(id);
          setTitle(fetchedTodo.title);
          setDescription(fetchedTodo.description || '');
        } catch (error) {
          console.error('Error fetching todo:', error);
          setError('Error loading todo. It may have been deleted or not synchronized yet.');
        } finally {
          setLoading(false);
        }
      };

      fetchTodo();
    }
  }, [id, isNewTodo]);

  // Save todo (create or update)
  const saveTodo = async () => {
    const validationError = validateTodo(title, description);
    if (validationError) {
      setTitleError(validationError);
      return;
    }

    try {
      setSaving(true);
      const action = isNewTodo ? 'creating' : 'updating';
      
      if (isNewTodo) {
        await TodoRepository.create(title.trim(), description.trim());
      } else {
        await TodoRepository.update(id, {
          title: title.trim(),
          description: description.trim()
        });
      }
      
      setSnackbarMessage(`Todo ${action} successfully`);
      setSnackbarVisible(true);
      setTimeout(() => router.back(), 1000);
    } catch (error) {
      setSnackbarMessage(handleError(error, isNewTodo ? 'creating' : 'updating'));
      setSnackbarVisible(true);
      setSaving(false);
    }
  };

  // Delete todo
  const handleDelete = async () => {
    if (isNewTodo) return;
    
    try {
      setSaving(true);
      await TodoRepository.delete(id);
      setSnackbarMessage('Todo deleted successfully');
      setSnackbarVisible(true);
      setTimeout(() => router.back(), 1000);
    } catch (error) {
      setSnackbarMessage(handleError(error, 'deleting'));
      setSnackbarVisible(true);
      setSaving(false);
    }
  };

  // Toggle todo completion
  const toggleComplete = async () => {
    if (isNewTodo) return;
    
    try {
      setSaving(true);
      const updatedTodo = await TodoRepository.toggleComplete(id);
      setSnackbarMessage(`Todo marked as ${updatedTodo.completed ? 'completed' : 'active'}`);
      setSnackbarVisible(true);
      setSaving(false);
    } catch (error) {
      setSnackbarMessage(handleError(error, 'updating'));
      setSnackbarVisible(true);
      setSaving(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: isNewTodo ? 'Add Todo' : 'Edit Todo',
        }}
      />
      
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={buttonColor} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <ThemedText style={[styles.errorText, { color: errorColor }]}>
            {error}
          </ThemedText>
          <Button 
            mode="outlined" 
            onPress={() => router.back()} 
            style={styles.button}
          >
            Go Back
          </Button>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.form}>
            <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
              <TextInput
                label="Title"
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  setTitleError('');
                }}
                mode="outlined"
                style={styles.input}
                error={!!titleError}
                theme={{ colors: { text: textColor } }}
              />
              {titleError ? (
                <ThemedText style={[styles.errorText, { color: errorColor }]}>
                  {titleError}
                </ThemedText>
              ) : null}

              <TextInput
                label="Description (optional)"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={4}
                theme={{ colors: { text: textColor } }}
              />
              
              {!isNewTodo && (
                <View style={styles.completionContainer}>
                  <ThemedText style={styles.statusLabel}>Status:</ThemedText>
                  <Button
                    mode="outlined"
                    onPress={toggleComplete}
                    loading={saving}
                    disabled={saving}
                    icon={title && description ? "check" : "circle"}
                    style={styles.statusButton}
                  >
                    {title && description ? "Completed" : "Active"}
                  </Button>
                </View>
              )}
            </View>

            <Button
              mode="contained"
              onPress={saveTodo}
              style={styles.button}
              loading={saving}
              disabled={saving}
            >
              {isNewTodo ? 'Create Todo' : 'Update Todo'}
            </Button>
            
            {!isNewTodo && (
              <Button
                mode="outlined"
                onPress={handleDelete}
                style={[styles.button, styles.deleteButton]}
                disabled={saving}
                textColor={errorColor}
                icon="trash"
              >
                Delete Todo
              </Button>
            )}
          </View>
        </ScrollView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  deleteButton: {
    marginTop: 16,
    borderColor: '#f44336',
  },
  errorText: {
    marginTop: -8,
    marginBottom: 16,
    marginLeft: 8,
    fontSize: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  completionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusLabel: {
    marginRight: 16,
    fontSize: 16,
  },
  statusButton: {
    flex: 1,
  }
});