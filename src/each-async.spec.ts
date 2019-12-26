import eachAsync from './each-async';


describe('EachAsync', () => {
    it('asyncIterator fn error', async () => {
        const count = 10;
        expect.assertions(count);

        const asyncIterator = async function*() {
            let i = 0;
            while (true) {
                i++;
                const done = i > count;
                if (done) {
                    return;
                }
                yield 10;
            }
        };

        let i = 0;
        await expect(
            eachAsync(
                asyncIterator(),
                async value => {
                    expect(value).toBe(10);
                    i++;
                    if (i === 8) {
                        throw new Error('AsyncIterator Error');
                    }
                },
                { parallel: 2 },
            ),
        ).rejects.toThrow('AsyncIterator Error');
        return true;
    });

    it('asyncIterator error', async () => {
        const count = 10;
        expect.assertions(count);

        const asyncIterator = async function*() {
            let i = 0;
            while (true) {
                i++;
                const done = i > count;
                if (i === 9) {
                    throw new Error('AsyncIterator Error');
                }
                if (done) {
                    return;
                }
                yield 10;
            }
        };

        await expect(
            eachAsync(
                asyncIterator(),
                async value => {
                    expect(value).toBe(10);
                },
                { parallel: 2 },
            ),
        ).rejects.toThrow('AsyncIterator Error');
    });

    it('asyncIterator', async () => {
        const count = 1e4;
        expect.assertions(count + 1);

        let i = 0;
        const asyncIterator = {
            [Symbol.asyncIterator]: () => ({
                async next() {
                    i++;
                    return { value: 10, done: i > count };
                },
            }),
        };

        await eachAsync(
            asyncIterator,
            async value => {
                expect(value).toBe(10);
            },
            { parallel: 500 },
        );

        expect(true).toBe(true);
    });

    it('async generator', async () => {
        const count = 10;
        expect.assertions(count + 1);

        const asyncIterator = async function*() {
            let i = 0;
            while (true) {
                i++;
                const done = i > count;
                if (done) {
                    return;
                }
                yield 10;
            }
        };

        await eachAsync(
            asyncIterator(),
            async value => {
                expect(value).toBe(10);
            },
            { parallel: 2 },
        );

        expect(true).toBe(true);
    });
});
