import sys
import json

data=json.loads(sys.argv[1]);

# usage: python [option] ... [-c cmd | -m mod | file | -] [arg] ...

import matplotlib.pyplot as plt

ids=[]
for i in range(len(data)):
    ids.append(data[i]["id"])

import re

corpus=[]
for i in range(len(data)):
    text=data[i]["text"].lower();
    text=re.sub('[^a-z0-9]',' ',text);
    corpus.append(text);

from sklearn.feature_extraction.text import CountVectorizer

cv=CountVectorizer(max_features=5000)
x=cv.fit_transform(corpus).toarray()

from sklearn.decomposition import PCA

pca=PCA(n_components=2)
coordinates=pca.fit_transform(x)

distance_threshold=((10/100)*x.shape[1])**0.5

import scipy.cluster.hierarchy as sch

dendogram=sch.dendrogram(sch.linkage(x,method='ward'),labels=ids,orientation='right',color_threshold=distance_threshold,above_threshold_color='black')

plt.axvline(distance_threshold,label='distance threshold : {0:0.2f} units'.format(distance_threshold))#,color='red')
plt.legend()
plt.title('Dendrogram')
plt.xlabel('Dissimalarity measure -->')
plt.ylabel('Roll No.')
plt.grid(b='true',linestyle='--')
plt.tight_layout()
plt.savefig('./python-stuff/dendro.png',dpi=500,pad_inches=10)

from sklearn.cluster import AgglomerativeClustering

hc=AgglomerativeClustering(n_clusters=None,affinity='euclidean',linkage='ward',distance_threshold=distance_threshold)
y_pred=hc.fit_predict(x)

data1=[]
for i in range(len(data)):
    d={
        "id": data[i]["id"],
        "cluster": y_pred[i],
        "coordinate": coordinates[i].tolist()
    }
    data1.append(d)
print(data1)
