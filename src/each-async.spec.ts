import eachAsync from './each-async';

describe('EachAsync', () => {

    async function * range (num) {
        for(let i = 0; i < num; i++) {
            yield i;
        }
    }

    it('async generator', async () => {
        const count = 10;
        let expectedValue = 0;
        expect.assertions(count);

        await eachAsync(
            range(count),
            async value => {
                expect(value).toBe(expectedValue);
                expectedValue++;
            },
            { parallel: 2 },
        );
    });

    it('asyncIterator fn error', async () => {
        const count = 10;
        let expectedValue = 0;
        expect.assertions(count);

        await expect(
            eachAsync(
                range(count),
                async value => {
                    expect(value).toBe(expectedValue);
                    expectedValue++;
                    if (expectedValue === count - 1) {
                        throw new Error('AsyncIterator Error');
                    }
                },
                { parallel: 1 },
            ),
        ).rejects.toThrow('AsyncIterator Error');
    });

    it('asyncIterator error', async () => {
        const count = 10;
        expect.assertions(count - 1);

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
                { parallel: 1 },
            ),
        ).rejects.toThrow('AsyncIterator Error');
    });

});
