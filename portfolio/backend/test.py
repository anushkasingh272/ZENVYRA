import urllib.request
import urllib.error

try:
    req = urllib.request.Request('http://localhost:8000/auth/demo', method='POST')
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    print(e.read().decode())
