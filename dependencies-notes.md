# Dependencies Notes

Notes on dependencies, particularly reasons for not updating to their latest versions.

## Development Dependencies

|Dependency                            |Current |Latest  |Notes                                                                 |
|--------------------------------------|--------|--------|----------------------------------------------------------------------|
|@types/react                          |18.3.20 |19.1.2  |React 19                                                              |
|@types/react-dom                      |18.3.6  |19.1.2  |React 19                                                              |
|cypress                               |11.2.0  |14.3.2  |v12 errors -- some related to `isolatedModules` setting, but not all. |

## Runtime Dependencies

|Dependency          |Current |Latest  |Notes                                                                                   |
|--------------------|--------|--------|----------------------------------------------------------------------------------------|
|@pixi/react         |7.1.2   |8.0.1   |Requires pixi.js v8, React 19, and non-trivial migration                                |
|pixi.js             |7.4.3   |8.9.1   |v8 requires non-trivial migration                                                       |
|react               |18.3.1  |19.1.0  |React 19                                                                                |
|react-dom           |18.3.1  |19.1.0  |React 19                                                                                |
