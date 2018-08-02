# jQuery Pane

## Usage

Default usage:
```javascript
// Init without options
PaneManager()

// Init with options
PaneManager({container: '#myContainer'})
```

## Options

- `container`: container where .pane-wrapper will be create (default: body)
- `loader`: loader content for `.pane-loader` element whose created during ajax loading

## Events

- `show.pane`: This event fires immediately when the pane is create
- `shown.pane`: This event is fired when the pane is completely visible to the user (animations included)
- `hide.pane`: This event fires immediately when close action is detected 
- `hidden.pane`: This event is fired when the pane is completely hidden to the user (animations included)
- `loading.content.pane`: This event fires immediately when AJAX content start to loading
- `loaded.content.pane`: This event fires is fired when AJAX content is loaded
- `printed.content.pane`: This event fires is fired when text content of AJAX result is printed
- `error.content.pane`: This event fires immediately when AJAX error occurred
