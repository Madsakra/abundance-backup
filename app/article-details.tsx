import { Entypo } from '@expo/vector-icons';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Pressable,
} from 'react-native';

import { fetchArticleById } from '~/actions/actions';

export default function ArticleDetails() {
  const params = useLocalSearchParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeArticle: () => void;

    (async () => {
      unsubscribeArticle = await fetchArticleById(params.id as string, setArticle).finally(() => {
        setLoading(false);
      });
    })();

    return () => {
      if (unsubscribeArticle) unsubscribeArticle();
    };
  }, [params.id]);

  if (loading) return <ActivityIndicator size="large" color="#399F9F" />;

  if (!article) return <Text style={styles.errorText}>Article not found.</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Link
        style={{
          marginBottom: 30,
        }}
        href="/">
        <Entypo name="chevron-left" size={30} color="black" />
      </Link>

      <View style={styles.card}>
        <Image source={{ uri: article.image || '' }} style={styles.image} />

        {/* Title Section */}
        <View style={styles.section}>
          <Text style={styles.title}>{article.title}</Text>
        </View>

        {/* Header Section*/}

        <Pressable
          style={[styles.section, { flexDirection: 'row', alignItems: 'center', gap: 20 }]}
          onPress={() => router.navigate(`/(requestAdvice)/${article?.writtenBy?.uid}`)}>
          <Image source={{ uri: article?.writtenBy?.avatar }} style={styles.avatar} />
          <View>
            <Text style={{ fontWeight: 'bold' }}>{article.writtenBy?.name}</Text>
            <Text>{article?.writtenBy?.email}</Text>
          </View>
        </Pressable>

        {/* Content Section */}
        <View style={styles.section}>
          <Text style={styles.content}>{article.description}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
    paddingTop: 80,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginTop: 20 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
});
