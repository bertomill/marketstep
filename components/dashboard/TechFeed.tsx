'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, Timestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface FeedItem {
  id: string;
  title: string;
  content: string;
  source: string;
  publishedAt: Timestamp;
  type: 'news' | 'update' | 'analysis';
}

export function TechFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const feedRef = collection(db, 'feed');
        const q = query(feedRef);
        const querySnapshot = await getDocs(q);
        
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FeedItem[];

        setFeedItems(items);
      } catch (error) {
        console.error('Error fetching feed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {feedItems.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.source}</CardDescription>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(item.publishedAt.seconds * 1000).toLocaleDateString()}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{item.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 