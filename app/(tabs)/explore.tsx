import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Divider, List, Switch } from 'react-native-paper';

import { Collapsible } from '../../components/Collapsible';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useDatabase } from '../../hooks/useDatabase';
import { useThemeColor } from '../../hooks/useThemeColor';
import { localDB, remoteDB } from '../../lib/db';
import { TodoRepository } from '../../lib/models/todo';

export default function ExploreScreen() {
  const [syncStatus, setSyncStatus] = useState('Not connected');
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [docsCount, setDocsCount] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [checking, setChecking] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  
  const { syncError, restartSync } = useDatabase();
  
  const backgroundColor = useThemeColor({ light: '#f5f5f5', dark: '#000000' }, 'background');
  const cardBackgroundColor = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');
  const buttonColor = useThemeColor({ light: '#2196f3', dark: '#4dabf5' }, 'tint');
  const secondaryTextColor = useThemeColor({ light: '#757575', dark: '#a0a0a0' }, 'text');
  const errorColor = useThemeColor({ light: '#f44336', dark: '#f44336' }, 'text');

  // Check database info on mount
  useEffect(() => {
    updateDatabaseInfo();
  }, []);

  // Update database info
  const updateDatabaseInfo = async () => {
    try {
      setChecking(true);
      
      // Get local database info
      const localInfo = await localDB.info();
      setDocsCount(localInfo.doc_count);
      
      // Check server connection
      try {
        const remoteInfo = await remoteDB.info();
        setServerInfo(remoteInfo);
        setSyncStatus('Connected');
      } catch (error) {
        console.error('Server connection error:', error);
        setServerInfo(null);
        setSyncStatus('Offline');
      }
      
      // Get completed todos count
      const completedTodos = await TodoRepository.getByStatus(true);
      setCompletedCount(completedTodos.length);
      
    } catch (error) {
      console.error('Error updating database info:', error);
    } finally {
      setChecking(false);
    }
  };

  // Toggle auto sync
  const toggleAutoSync = () => {
    setAutoSync(!autoSync);
    // In a real app, this would update the sync configuration
  };

  // Force sync
  const forceSync = () => {
    restartSync();
    updateDatabaseInfo();
  };

  // Clear all todos
  const clearAllTodos = async () => {
    try {
      setChecking(true);
      
      // Get all todos
      const todos = await TodoRepository.getAll();
      
      // Delete each todo
      for (const todo of todos) {
        await TodoRepository.delete(todo._id);
      }
      
      // Update counts
      setDocsCount(0);
      setCompletedCount(0);
      
    } catch (error) {
      console.error('Error clearing todos:', error);
    } finally {
      setChecking(false);
    }
  };

  const getStatusColor = () => {
    if (syncStatus === 'Connected') return '#4caf50';
    if (syncStatus === 'Offline') return errorColor;
    return secondaryTextColor;
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView>
        <View style={styles.content}>
          {/* Status Card */}
          <Card style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
            <Card.Content>
              <ThemedText style={styles.cardTitle}>Database Status</ThemedText>
              
              {checking ? (
                <View style={styles.centerContainer}>
                  <ActivityIndicator size="small" color={buttonColor} />
                </View>
              ) : (
                <>
                  <View style={styles.statusItem}>
                    <ThemedText style={styles.statusLabel}>Local Documents:</ThemedText>
                    <ThemedText style={styles.statusValue}>{docsCount}</ThemedText>
                  </View>
                  
                  <View style={styles.statusItem}>
                    <ThemedText style={styles.statusLabel}>Completed Tasks:</ThemedText>
                    <ThemedText style={styles.statusValue}>{completedCount}</ThemedText>
                  </View>
                  
                  <View style={styles.statusItem}>
                    <ThemedText style={styles.statusLabel}>Server Status:</ThemedText>
                    <ThemedText 
                      style={[
                        styles.statusValue, 
                        { color: getStatusColor() }
                      ]}
                    >
                      {syncStatus}
                    </ThemedText>
                  </View>
                  
                  {syncError && (
                    <View style={styles.errorContainer}>
                      <ThemedText style={[styles.errorText, { color: errorColor }]}>
                        {syncError.message || 'Error connecting to server'}
                      </ThemedText>
                    </View>
                  )}
                </>
              )}
              
              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={updateDatabaseInfo}
                  style={styles.button}
                  disabled={checking}
                >
                  Refresh
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={forceSync}
                  style={styles.button}
                  disabled={checking}
                >
                  Force Sync
                </Button>
              </View>
            </Card.Content>
          </Card>
          
          {/* Settings Card */}
          <Card style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
            <Card.Content>
              <ThemedText style={styles.cardTitle}>Settings</ThemedText>
              
              <List.Item
                title="Auto Sync"
                description="Automatically sync when online"
                left={props => <List.Icon {...props} icon="sync" />}
                right={() => (
                  <Switch
                    value={autoSync}
                    onValueChange={toggleAutoSync}
                    color={buttonColor}
                  />
                )}
              />
              
              <Divider style={styles.divider} />
              
              <List.Item
                title="Server URL"
                description={serverInfo?.db_name ? `${serverInfo.db_name} (v${serverInfo.version})` : 'Not connected'}
                left={props => <List.Icon {...props} icon="server" />}
              />
              
              <Divider style={styles.divider} />
              
              <Collapsible title="Advanced Options">
                <View style={styles.dangerZone}>
                  <ThemedText style={styles.dangerZoneTitle}>
                    Danger Zone
                  </ThemedText>
                  
                  <ThemedText style={styles.dangerZoneDescription}>
                    These actions cannot be undone. Be careful!
                  </ThemedText>
                  
                  <Button
                    mode="outlined"
                    onPress={clearAllTodos}
                    style={styles.dangerButton}
                    textColor={errorColor}
                    icon="delete"
                  >
                    Delete All Todos
                  </Button>
                </View>
              </Collapsible>
            </Card.Content>
          </Card>
          
          {/* About Card */}
          <Card style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
            <Card.Content>
              <ThemedText style={styles.cardTitle}>About</ThemedText>
              
              <ThemedText style={styles.aboutText}>
                TodoGenius is an offline-first to-do application that uses PouchDB for local 
                storage and syncs with a CouchDB server.
              </ThemedText>
              
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <FontAwesome name="wifi" size={20} color={buttonColor} style={styles.featureIcon} />
                  <ThemedText style={styles.featureText}>
                    Works offline, syncs when online
                  </ThemedText>
                </View>
                
                <View style={styles.featureItem}>
                  <FontAwesome name="database" size={20} color={buttonColor} style={styles.featureIcon} />
                  <ThemedText style={styles.featureText}>
                    Data persists across sessions
                  </ThemedText>
                </View>
                
                <View style={styles.featureItem}>
                  <FontAwesome name="shield" size={20} color={buttonColor} style={styles.featureIcon} />
                  <ThemedText style={styles.featureText}>
                    Secure data storage
                  </ThemedText>
                </View>
              </View>
              
              <ThemedText style={styles.versionText}>
                Version 1.0.0
              </ThemedText>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  divider: {
    marginVertical: 8,
  },
  dangerZone: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  dangerZoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f44336',
    marginBottom: 8,
  },
  dangerZoneDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  dangerButton: {
    borderColor: '#f44336',
  },
  errorContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  aboutText: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  featureList: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 14,
  },
  versionText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
});