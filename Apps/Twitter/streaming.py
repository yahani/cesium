import tweepy
import json
import uuid

consumer_key="WzcwXeSIVjSTBhZR0eHhQ"
consumer_secret="IK39L4ROWp0lFNaD2eY4hNQY6xcNuGHD6RDqnFYfc"
access_key = "763293326-yOBK31MLFHMFSIw2WgXTeEEyzzBSrNxOqbGCzL8J"
access_secret = "LRYMNR1BDlgLrI63AGAYRwmByKRv1fNsjSbY1xnQ" 


auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_key, access_secret)
api = tweepy.API(auth)

def parseTweet(tweet):
	if tweet.geo:
		return {
			"text": tweet.text,
			"longitude": tweet.geo['coordinates'][1],
			"latitude" : tweet.geo['coordinates'][0],
			"time" : str(tweet.created_at),
			"user_id" : tweet.user.id,
			"tweet_id" : tweet.id
		}
	

class CustomStreamListener(tweepy.StreamListener):
    def on_status(self, status):
		if status.geo:
			with open('tweets.txt','a+') as f:
				f.write(json.dumps(parseTweet(status)))
		print status.geo

    def on_error(self, status_code):
        print 'Encountered error with status code:', status_code
        return True # Don't kill the stream

    def on_timeout(self):
        print 'Timeout...'
        return True # Don't kill the stream

		
sapi = tweepy.streaming.Stream(auth, CustomStreamListener())
sapi.filter(locations=[-180,-90,180,90])