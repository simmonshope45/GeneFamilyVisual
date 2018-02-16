from flask import *
from flask_sqlalchemy import *
from sqlalchemy.dialects.postgresql import JSON
import sys

app = Flask(__name__)

@app.route('/hello')
def helloWorld():
    return '<html>Hello World</html>'

# configure postgres settings
POSTGRES = {
    'user': 'postgres',
    'pw': '',
    'db': 'postgres',
    'host': 'db',
    'port': '5432',
}
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://%(user)s:\%(pw)s@%(host)s:%(port)s/%(db)s' % POSTGRES
db = SQLAlchemy(app)

# set config to get rid of error
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

#### MODELS ####
class GraphData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    json_data = db.Column(JSON)



# Create graph_data route
@app.route('/graph', methods=['POST'])
def create_graph_data():
    # get data from request
    data = request.get_json()

    # create a new graph object with the data from the request
    new_graph = GraphData(json_data=data['json_data'])

    # add the graph to the session
    db.session.add(new_graph)

    # commit the changes to the database
    db.session.commit()

    # return a response
    return jsonify({'message': 'Success! graph created.'})

#Get Graphs
@app.route("/graph", methods =['GET'])
def getGraphs():
    graphs = GraphData.query.all()
    graph_list = []

    for graph in graphs:
        graph_data = {}
        graph_data['json_data'] = graph.json_data
        graph_data['id'] = graph.id
        graph_list.append(graph_data)

    return jsonify({"Graph Datasets: " : graph_list})

# route to create the tables in the database (should only be done once)
@app.route('/create_db')
def create_db():
    db.create_all()
    return 'Success!'

if __name__ == '__main__':
    print("Running on port 5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
