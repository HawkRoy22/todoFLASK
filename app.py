from flask import Flask, render_template, url_for, request, redirect
#from flask.ext. import Nav
from flask.globals import request
from werkzeug.utils import redirect
from flask_sqlalchemy import SQLAlchemy
from datetime import date, datetime

app = Flask(__name__)
# Adding a Navbar using Flask Navigation
#nav = Navigation(app)
# Initalizes database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
db = SQLAlchemy(app)

nav.Bar('top', [
    nav.Item('HOME', 'index'),
    nav.Item('SETTINGS', 'settings'),
])

@app.route('/')
def index():
    return render_template(index.html)

@app.route('settings')
def settings():
    return render_template('settings.html')



class Todo(db.Model):
    # Integer that references the id of each entry
    id = db.Column(db.Integer, primary_key = True)
    content = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Integer, default=0)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)

    #Everytime you make an element it return the task and it's id
    def __repr__(self):
        return '<Task %r>' % self.id

@app.route('/', methods=['POST', 'GET'])
def index():
    if request.method == 'POST':
        task_content = request.form['content']
        new_task = Todo(content=task_content)

        try:
            db.session.add(new_task)
            db.session.commit()
            return redirect('/')
        except:
            return 'There was an issue adding your task'
    else:
        # Looks at database content in order created and returns it from new to old
        tasks = Todo.query.order_by(Todo.date_created).all()
        return render_template('index.html', tasks=tasks)

@app.route('/delete/<int:id>')
def delete(id):
    task_to_delete = Todo.query.get_or_404(id)

    try:
        db.session.delete(task_to_delete)
        db.session.commit()
        return redirect('/')
    except:
        return 'There was a problem deleting that task'

@app.route('/update/<int:id>', methods=['GET', 'POST'])
def update(id):
    task = Todo.query.get_or_404(id)

    if request.method == 'POST':
        task.content = request.form['content']

        try:
            db.session.commit()
            return redirect('/')
        except:
            return 'There was an issue updating your task'

    else:
        return render_template('update.html', task=task)


if __name__ == "__main__":
    app.run(debug=True)
