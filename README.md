# jQuery Pane

## Usage

### HTML

Default HTML structure of pane: 
```html
<div class="pane">
  <div class="pane-content">
    <div class="pane-title">
      <button type="button" data-dismiss="pane">X</button>
      <h2 class="title">My pane title</h2>
    </div>
    <div class="pane-body">
      ...
    </div>
  </div>
</div>
```

> **Warning**:
>
> `div.pane` is automatically created by library.  

### JavaScript

Default usage:
```javascript
// Init without options
PaneManager()

// Init with options
PaneManager({container: '#myContainer'})
```

### Triggers

Links, buttons or others HTML elements can open panes, with `data-toggle="pane"`.

Link example:
```html
<a href="/my-page.html" data-toggle="pane">My link</a>
```

Button example:
```html
<button type="button" data-toggle="pane" data-href="/my-page.html">My button</button>
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

## Methods

A jQuery method is available to interact with pane, and only panes.

```javascript
// Reload pane content
$('.pane').pane('reload');

// Load content
$('.pane').pane('load', '/path/page.html');

// Close pane
$('.pane').pane('reload');
```