from bs4 import BeautifulSoup as soup
from urllib.request import urlopen as uReq
import re
from googlesearch import search

map_url_to_scrapped_text={};
map_url_to_match_no={};

def url_scrapper(url):
    if url in map_url_to_scrapped_text.keys():
        return map_url_to_scrapped_text[url];
    try:
        uClient=uReq(url,timeout=0.5);
        page_html=uClient.read();
        uClient.close();
        
        page_soup=soup(page_html,"html.parser");
        container=page_soup.findAll(["body"])[0];
        scrapped_text=container.text.lower();
        
        scrapped_text=re.sub('[^a-z0-9.]',' ',scrapped_text);
        scrapped_text=re.sub(' +',' ',scrapped_text);
        
        map_url_to_scrapped_text[url]=scrapped_text
        
        return map_url_to_scrapped_text[url];
    except:
        return "";

import sys
import json

data=json.loads(sys.argv[1]);
input_text=data["text"]

input_text=input_text.lower();
input_text=re.sub('[^a-z0-9.]',' ',input_text);
input_text=re.sub(' +',' ',input_text);
input_text_container=input_text.split('.');

for i in range(len(input_text_container)):
    input_text_container[i]=input_text_container[i].strip();

n=len(input_text_container);
ans=0;

for text in input_text_container:
    if(len(text)<10):
        n=n-1;
        continue;
    try:
        urls=search(text, tld="co.in", num=5, stop=5, pause=2);
        for url in urls:
            if(url[-4:]!=".pdf"):
                try:
                    scrapped_text=url_scrapper(url);
                    if(text in scrapped_text):
                        ans=ans+1;
                        if(url in map_url_to_match_no.keys()):
                            map_url_to_match_no[url]=map_url_to_match_no[url]+1;
                        else:
                            map_url_to_match_no[url]=1;
                        break;
                except:
                    continue;
    except:
        continue;
for key in map_url_to_match_no.keys():
    map_url_to_match_no[key]=map_url_to_match_no[key]/n;
    
map_url_to_match_no

output={
    "plagiarism-percentage": ans/n,
    "urls": map_url_to_match_no
}

print(output);