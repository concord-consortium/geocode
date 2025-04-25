# Dependencies Notes

Notes on dependencies, particularly reasons for not updating to their latest versions.

## Development Dependencies

|Dependency                            |Current |Latest  |Notes                                                                 |
|--------------------------------------|--------|--------|----------------------------------------------------------------------|
|@testing-library/react                |12.1.5  |16.3.0  |React 18/19                                                           |
|@types/react                          |17.0.85 |19.1.2  |React 18/19                                                           |
|@types/react-dom                      |17.0.26 |19.1.2  |React 18/19                                                           |
|@types/react-leaflet                  |2.8.3   |N/A     |Newer versions of react-leaflet include their own types               |
|@types/styled-components              |5.1.34  |N/A     |Newer versions of styled-components include their own types           |
|cypress                               |11.2.0  |14.3.2  |v12 errors -- some related to `isolatedModules` setting, but not all. |

## Runtime Dependencies

|Dependency          |Current |Latest  |Notes                                                                                   |
|--------------------|--------|--------|----------------------------------------------------------------------------------------|
|@pixi/react         |7.1.2   |8.0.1   |Requires pixi.js v8, React 19, and non-trivial migration                                |
|color               |4.2.3   |5.0.0   |Compilation errors with v5                                                              |
|js-interpreter      |1.4.6   |6.0.1   |v1.4.6 is deprecated; cypress test failures or compilation errors with newer versions.  |
|mathjs              |12.4.3  |14.3.1  |v13 requires ES2020 browsers; would require polyfills.                                  |
|pixi.js             |7.4.3   |8.9.1   |v8 requires non-trivial migration                                                       |
|react               |17.0.2  |19.1.0  |React 18/19                                                                             |
|react-dom           |17.0.2  |19.1.0  |React 18/19                                                                             |
|react-leaflet       |2.8.0   |5.0.0   |v3 requires non-trivial migration; newer versions require React 18/19.                  |
|react-tabs          |4.3.0   |6.1.0   |React 18/19                                                                             |
|styled-components   |5.3.11  |6.1.17  |v6 requires non-trivial migration                                                       |
