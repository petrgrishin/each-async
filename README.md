each-async
=========
Async generators/iterators in parallel

```javascript
// >= nodejs v10.17

const fileStream = fs.createReadStream('./file.txt');
const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
});

await eachAsync(
    rl,
    async value => {
        console.log(value);
    },
    { 
      parallel: 2, 
    },
);
```

