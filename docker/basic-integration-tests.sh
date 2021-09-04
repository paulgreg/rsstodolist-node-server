#!/bin/bash
echo "\nHomepage:"
curl -XGET "http://localhost:8080/"
echo "\nRSS feed:"
curl -XGET "http://localhost:8080/?n=somename"
echo "\nAdd:"
curl -IXGET "http://localhost:8080/add?n=somename&u=https://www.qwant.com/"
echo "\nRSS feed:"
curl -XGET "http://localhost:8080/?n=somename"
echo "\nDel:"
curl -IXGET "http://localhost:8080/del?n=somename&u=https://www.qwant.com/"
echo "\nRSS feed:"
curl -XGET "http://localhost:8080/?n=somename"