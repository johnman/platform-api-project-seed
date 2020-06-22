(function () {

    if (!window.fin) {
        return;
    }

    console.log('Running in OpenFin! Modifying behaviors and configuring themes.');

    const LIGHT_THEME = 'light-theme';

    function setContexts(context) {
        if (context !== undefined) {
            if (context.theme) {
                setTheme(context.theme);
            }

            if (context.country) {
                updateInput('country-input', context.country);
            }
        }
    }

    function setTheme(theme) {
        const root = document.documentElement;

        if (theme === LIGHT_THEME) {
            root.classList.add(LIGHT_THEME);
        } else {
            root.classList.remove(LIGHT_THEME);
        }
    }

    function updateInput(id, value) {
        // React wont react to external modifications like you might expect:
        // https://stackoverflow.com/questions/42550341/react-trigger-onchange-if-input-value-is-changing-by-state
        // https://hustle.bizongo.in/simulate-react-on-change-on-controlled-components-baa336920e04

        let element = document.getElementById(id);

        if (!element)
            return;

        let elPrototype = Object.getPrototypeOf(element);
        let protoValueSet = Object.getOwnPropertyDescriptor(elPrototype, 'value').set;

        protoValueSet.call(element, value);

        element.dispatchEvent(new Event('input', { bubbles: true }));
    }

    fin.me.on('host-context-changed', ({ context }) => setContexts(context));
    fin.Platform.getCurrentSync().getWindowContext().then(context => setContexts(context));


    console.log('Adding custom DOM changes')
    // This logic doesnt work perfectly during a "hot reload", but attempts to get around
    // the non-deterministic React Rendering
    const observer = new MutationObserver(() => {
        const navbar = document.getElementById('navbar');

        if (navbar) {
            observer.disconnect();
            navbar.style.display = 'none';

            const browserButton = document.createElement('div');
            browserButton.innerText = 'Open in Browser';
            browserButton.onclick = () => fin.System.openUrlWithBrowser(location.href);
            browserButton.style = `
            position: absolute;
            top: 4px;
            right: 4px;
            background-color: var(--of-highlight);
            color: var(--of-default-white);
            user-select: none;
            padding: 2px;
            `;
            document.body.appendChild(browserButton);

            fin.Platform.getCurrentSync().getWindowContext().then((context) => {
                if (context !== undefined && context !== null) {
                    if (context.theme) {
                        setTheme(context.theme);
                    }

                    if (context.country) {
                        console.log('setting initial country', context.country);
                        updateInput('country-input', context.country);
                    }
                }

            });
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

})();

window.dash_clientside = {
    ...window.dash_clientside,  // formality, incase there is more than one script...
    openfin: {
        changeCountry: function (country) {
            if (!window.fin) {
                return;
            }
            fin.Platform.getCurrentSync().setWindowContext({ country });
            return country;
        }
    }
};
