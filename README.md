# Curriculum Vitae

This project can be used to publish your CV as a website. It does not require any serverside scripting capabilities since all data is loaded with JavaScript using [jQuery](https://jquery.com/), and then rendered using [jsRender](https://www.jsviews.com/) templates.

Any data you want to be shown is put in `/assets/data/main.json`. You can copy the file `/assets/example/main.example.json` to `/assets/data/main.json` and make changes to that.

The structure of `main.json` looks like this:
```json
{
    "sections": [
        {
            "type": "profile",
            "name": "Me",
            ...
        },
        {
            "type": "html",
            "name": "Some Info",
            ...
        },
    ]
}
```
>There is no hardcoded limit to the amount of sections you can add, but it will impact how long time it takes to load all your data.

## Section Templates
There is 5 section templates available, `profile`, `html`, `list`, `gallery` and `contact`.

Each template needs some information that is specific to that template (found below) and some information is needed in all templates.

| Template | Data | Required | Type | Description | Example |
:-: | :-: | :-: | - | - | - |
(ALL) | `title` | yes | string | Title of the section | `"title": "Profile"`
(ALL) | `type` | yes | Section | Type of the section.<br>Valid values are `profile`, `html`, `list`, `gallery`, `contact`. | `"type": "profile"`
(ALL) | `data` | yes | Object/string | Content depends on which `type`.<br>See the individual sections below for each section type.
(ALL) | `classes` | no | Array | CSS classes that will be added to the section. | `"classes": [ "some-class", "some-other-class" ]`
(ALL) | `css` | no | Array | CSS statements that will be added to the section. | `"css": [ {"text-align": "center"}, {"display": "inline-block"} ]`
(ALL) | `colors` | no | Object | Colors for background and text. | `"colors": { "text": "#ffffff", "background": "rgba(128,128,128,0.5)" }`

### Profile Template
A profile sections `data` object contains name, birthdate, location and motto/tagline.

Key | Required | Description
:-: | :-: | -
`name` | yes | Your name
`location` | yes | Your location
`motto` | yes | Your motto/tagline
`born` | yes | Your birthdate<br>(used to calculate age)
`image` | yes | Your profile picture

An example of a profile section:
```json
{
    "type": "profile",
    "title": "Me",
    "data": {
        "name": "Izaac Brånn",
        "location": "Strängnäs, Sweden",
        "motto": "Father | Gamer | Developer",
        "born": "1989-06-30",
        "image": "assets/img/me.jpg"
    },
    "classes": [
        "cut-corner",
        "cc-tr"
    ],
    "css": [
        {"text-align": "center"}
    ],
    "colors": {
        "text": "#ffffff",
        "background": "rgba(128,128,128,.5)"
    }
}
```

### HTML Template
A HTML sections `data` contains a raw HTML string.

`"data": "<h3>Some raw HTML</h3>"`

An example of a HTML section:
```json
{
    "type": "html",
    "title": "Some info",
    "data": "<p>I like to dabble with programming of some kind, and also server administration.</p>",
    "classes": [
        "cut-corner",
        "cc-tr"
    ],
    "css": [
        {"text-align": "center"}
    ],
    "colors": {
        "text": "#ffffff",
        "background": "rgba(128,128,128,.5)"
    }
}
```

### List Template
A list sections `data` object contains multiple item object with a title and a description.

An example of a list section:
```json
{
    "type": "list",
    "title": "Experiences",
    "data": [
        { "title": "2018", "description": "Customer Support Representative at a nationwide internet service provider." },
        { "title": "2015", "description": "Customer Support Representative at a nationwide mobile service provider."}
    ],
    "classes": [
        "cut-corner",
        "cc-tr"
    ],
    "css": [
        {"text-align": "center"}
    ],
    "colors": {
        "text": "#ffffff",
        "background": "rgba(128,128,128,.5)"
    }
}
```

### Gallery Template
A gallery sections `data` object contains multiple item object with a title, image and an URL.

An example of a gallery section:
```json
{
    "type": "gallery",
    "title": "Portfolio",
    "data": [
        { "title": "Project 1", "url": "#project1", "image": "assets/img/portfolio/project1.png" },
        { "title": "Project 2", "url": "#project2", "image": "assets/img/portfolio/project2.png" },
        { "title": "Project 3", "url": "#project3", "image": "assets/img/portfolio/project3.png" },
        { "title": "Project 4", "url": "#project4", "image": "assets/img/portfolio/project4.png" }
    ],
    "classes": [
        "cut-corner",
        "cc-tr"
    ],
    "css": [
        {"text-align": "center"}
    ],
    "colors": {
        "text": "#ffffff",
        "background": "rgba(128,128,128,.5)"
    }
}
```

### Contact Template
A contact sections `data` object contains multiple ways to contact you.

An example of a contact section:
```json
{
    "type": "contact",
    "title": "Contact me",
    "data": {
        "web": "https://github.com/IzaacJ",
        "email": "my-email@example.com",
        "facebook": "MyFacebookName",
        "github": "MyGithubUsername",
        "twitter": "MyTwitterName",
        "phone": "010-123 45 67"
    },
    "classes": [
        "cut-corner",
        "cc-tr"
    ],
    "css": [
        {"text-align": "center"}
    ],
    "colors": {
        "text": "#ffffff",
        "background": "rgba(128,128,128,.5)"
    }
}
```

## So, how about hosting?
All requirements should be met by any hosting provider which can serve HTML sites. There is no database requirement, no server-side scripts of any kind.

You could even just fork this and publish it as a [GitHub Page](https://pages.github.com/)!

1. Fork this project
2. Go to the repository settings
3. Scroll down to the GitHub Pages section (when on the Options tab to the left)
4. Click on the Branch dropdown and select `main` as the source, and click save,
5. Clone it and use the info here to customize it to your liking!

The link for it can be viewed right above where you selected a branch.
If you didn't rename the repository after you forked it, the link should be `https://[your-github-name].github.io/cv/`