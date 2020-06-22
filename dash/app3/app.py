# -*- coding: utf-8 -*-
import dash
import dash_core_components as dcc
import dash_html_components as html
from dash.dependencies import ClientsideFunction, Input, Output

# POC - Let's just hard code these for now
platform_port = 5555
dash_port = 8052

app_name = 'Dash App 3'

external_stylesheets = [
    'https://codepen.io/chriddyp/pen/bWLwgP.css',
    f'http://localhost:{platform_port}/styles/frame-styles-template.css',
    f'http://localhost:{platform_port}/styles/light-theme.css'
]

app = dash.Dash(__name__, external_stylesheets=external_stylesheets)

count = 0

app.layout = html.Div(children=[
    html.Div(
        id='navbar',
        children=f'Home > {app_name}',
        style={
        'color': 'white',
        'backgroundColor': '#119dff',
        'padding': '2px'
        }
    ),

    html.H1(children=app_name),

    html.Div(children='''
        Dash: This app is designed to work in OpenFin and a Browser!
    '''),

    # Hidden text input, because I cannot find a way to
    # trick a dcc.Dropdown into updating programatically
    # TODO: explore dcc.Store instead...
    dcc.Input(
        id='country-input',
        value='USA',
        style={
            'display': 'none'
        }
    ),

    dcc.Dropdown(
        id='country-dropdown',
        options=[{'label': i, 'value': i} for i in ['USA', 'Canada']],
        value='USA'
    ),

    dcc.Graph(
        id='example-graph'
    ),
])

@app.callback(
    Output('country-dropdown', 'value'),
    [Input('country-input', 'value')]
)
def update_dropdown(input_country):
    return input_country

@app.callback(
    Output('example-graph', 'figure'),
    [Input('country-dropdown', 'value')])
def update_figure(selected_country):
    data = {
        'USA': [
                {'x': [1, 2, 3], 'y': [4, 1, 2], 'type': 'line', 'name': 'New York'},
                {'x': [1, 2, 3], 'y': [2, 4, 5], 'type': 'line', 'name': 'Los Angeles'},
        ],
        'Canada': [
                {'x': [1, 2, 3], 'y': [3, 1, 3], 'type': 'line', 'name': u'Montréal'},
                {'x': [1, 2, 3], 'y': [5, 2, 4], 'type': 'line', 'name': 'Toronto'},
        ]
    }
    return {
        'data': data[selected_country],
        'layout': {
            'title': 'Dash Data Visualization',
            'paper_bgcolor': 'transparent',
            'plot_bgcolor': 'transparent'
        }
    }


app.clientside_callback(
    ClientsideFunction(
        namespace = 'openfin',
        function_name = 'changeCountry'
    ),
    Output('country-input', 'placeholder'),
    [Input('country-dropdown', 'value')]
)

if __name__ == '__main__':
    app.run_server(debug=True, port=dash_port)
