import { parseStringPromise } from 'xml2js';

export async function getEarningsCalendar() {
  try {
    const response = await fetch('https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=8-K&company=&dateb=&owner=include&start=0&count=40&output=atom');
    const xml = await response.text();
    const result = await parseStringPromise(xml);
    
    // Filter for earnings related 8-K filings
    const earningsEvents = result.feed.entry
      .filter((entry: any) => 
        entry.title[0].toLowerCase().includes('earnings') ||
        entry.title[0].toLowerCase().includes('financial results')
      )
      .map((entry: any) => ({
        company: entry.title[0].split(' - ')[0],
        date: new Date(entry.updated[0]),
        link: entry.link[0].$.href
      }));

    return earningsEvents;
  } catch (error) {
    console.error('Error fetching SEC calendar:', error);
    return [];
  }
} 