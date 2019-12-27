import async, { AsyncResultCallback } from 'async';
import util from 'util';

export default util.promisify((asyncIterator, fn, options, callback) => {
    const next = async () => asyncIterator[Symbol.asyncIterator]().next();
    const parallel = options.parallel || 1;

    const handleNextResult = function(doc, callback) {
        const promise = fn(doc.value);
        if (promise && typeof promise.then === 'function') {
            promise.then(
                function() {
                    callback(null);
                },
                function(error) {
                    callback(error || new Error('`eachAsync()` promise rejected without error'));
                },
            );
        } else {
            callback(null);
        }
    };

    const iterate = function(callback) {
        let drained = false;
        const nextQueue = async.queue(function(task, cb: AsyncResultCallback<Error, IteratorReturnResult<any>> ) {
            if (drained) return cb();
            const nextPromise = next();
            nextPromise
                .then(doc => {
                    if (!doc || doc.done) {
                        drained = true;
                        cb();
                        return;
                    }
                    cb(null, doc);
                })
                .catch(err => {
                    return cb(err);
                });
        }, 1);

        const getAndRun = function(cb) {
            nextQueue.push({}, function(err, doc) {
                if (err) return cb(err);
                if (!doc) return cb();
                handleNextResult(doc, function(err) {
                    if (err) return cb(err);
                    // Make sure to clear the stack re: gh-4697
                    setTimeout(function() {
                        getAndRun(cb);
                    }, 0);
                });
            });
        };

        async.times(
            parallel,
            function(n, cb) {
                getAndRun(cb);
            },
            callback,
        );
    };

    return iterate(callback);
});
